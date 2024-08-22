import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle multipart form data with formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set up the directory for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Ensure the uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Initialize formidable with the directory to save files
  const form = formidable({
    uploadDir: uploadsDir,
    keepExtensions: true,
    multiples: false, // Ensure multiple files are not handled
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(500).json({ error: 'Error parsing the form data' });
    }

    console.log('Fields:', fields);  // Log fields received
    console.log('Files:', files);    // Log files received

    // Access the file correctly from the array
    const file = files.image && Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file || !file.filepath) {
      console.error('Image path is undefined.');
      return res.status(400).json({ error: 'Image path is undefined.' });
    }

    const imagePath = file.filepath;

    try {
      // Read the image file and convert it to a base64 string
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Upload the image to Facebook and get the image hash
      let imageHash;
      try {
        const imageUploadResponse = await axios.post(
          `https://graph.facebook.com/v20.0/act_${fields.adAccountId[0]}/adimages`,
          {
            bytes: base64Image, // Pass the base64 image data
          },
          {
            headers: {
              Authorization: `Bearer ${fields.accessToken[0]}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (imageUploadResponse.data && imageUploadResponse.data.images) {
          imageHash = imageUploadResponse.data.images.bytes.hash;
          console.log('Image uploaded successfully:', imageUploadResponse.data);
        } else {
          console.error('Failed to upload image. Response:', imageUploadResponse.data);
          return res.status(500).json({ error: 'Failed to upload image.', details: imageUploadResponse.data });
        }
      } catch (error) {
        console.error('Error uploading image:', error.response?.data || error.message || error);
        return res.status(500).json({ error: 'Failed to upload image.', details: error.response?.data || error.message });
      }

      // Step 1: Create Campaign
      const campaignPayload = {
        name: JSON.parse(fields.uploadedCampaign[0]).campaignDetails.objective || 'Default Campaign Name',
        objective: 'OUTCOME_TRAFFIC', // Adjust according to the Facebook Marketing API documentation
        status: 'PAUSED',
        special_ad_categories: [], // Adjust based on your specific needs
        access_token: fields.accessToken[0],
      };

      console.log('Creating campaign with payload:', campaignPayload);

      let campaignId;
      try {
        const campaignResponse = await axios.post(
          `https://graph.facebook.com/v20.0/act_${fields.adAccountId[0]}/campaigns`,
          campaignPayload
        );
        campaignId = campaignResponse.data.id;
        console.log('Campaign created successfully:', campaignResponse.data);
      } catch (error) {
        console.error('Error creating campaign:', error.response?.data || error.message || error);
        return res.status(500).json({ error: 'Failed to create campaign.', details: error.response?.data || error.message });
      }

      // Step 2: Create Ad Sets for each week in the planOutput
      const planOutput = JSON.parse(fields.uploadedCampaign[0]).planOutput;
      const adSetIds = [];

      for (const week of planOutput) {
        const adSetPayload = {
          name: `Ad Set - ${week.plansWeek}`,
          daily_budget: week.investAmount * 100, // Convert to cents
          currency: 'PHP', // Specify the currency as PHP (Philippine Peso)
          start_time: new Date(week.startingDay).toISOString(),
          end_time: new Date(new Date(week.startingDay).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          campaign_id: campaignId,
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'REACH',
          bid_strategy: 'LOWEST_COST_WITH_BID_CAP',
          bid_amount: 500, // Adjust or remove if not applicable
          targeting: {
            geo_locations: { countries: ['PH'] },
            age_min: 18,
            age_max: 65,
            genders: [1, 2],
          },
          status: 'PAUSED',
          access_token: fields.accessToken[0],
        };

        console.log(`Creating Ad Set for ${week.plansWeek} with payload:`, adSetPayload);

        try {
          const adSetResponse = await axios.post(
            `https://graph.facebook.com/v20.0/act_${fields.adAccountId[0]}/adsets`,
            adSetPayload
          );
          adSetIds.push(adSetResponse.data.id);
          console.log(`Ad Set created for ${week.plansWeek}:`, adSetResponse.data);
        } catch (error) {
          console.error(`Error creating ad set for ${week.plansWeek}:`, error.response?.data || error.message || error);
          return res.status(500).json({ error: `Failed to create ad set for ${week.plansWeek}.`, details: error.response?.data || error.message });
        }
      }

      // Step 3: Create Ad Creative using the image hash
      let creativeId;
      try {
        const adCreativePayload = {
          name: 'Ad Creative',
          object_story_spec: {
            page_id: fields.pageId[0], // Access the first element in the array
            link_data: {
              link: JSON.parse(fields.uploadedCampaign[0]).campaignDetails.adLink, // Use the extracted adLink here
              image_hash: imageHash, // Use the uploaded image hash
            },
          },
          degrees_of_freedom_spec: {
            creative_features_spec: {
              standard_enhancements: {
                enroll_status: 'OPT_OUT'
              }
            }
          },
          access_token: fields.accessToken[0],
        };

        console.log('Creating Ad Creative with payload:', adCreativePayload);

        const creativeResponse = await axios.post(
          `https://graph.facebook.com/v20.0/act_${fields.adAccountId[0]}/adcreatives`,
          adCreativePayload
        );
        creativeId = creativeResponse.data.id;
        console.log('Ad Creative created successfully:', creativeResponse.data);
      } catch (error) {
        console.error('Error creating ad creative:', error.response?.data || error.message || error);
        return res.status(500).json({ error: 'Failed to create ad creative.', details: error.response?.data || error.message });
      }

      // Step 4: Create Ads for each Ad Set
      const adResponses = [];
      for (const adSetId of adSetIds) {
        const adPayload = {
          name: 'New Ad',
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: 'PAUSED',
          access_token: fields.accessToken[0],
        };

        console.log('Creating Ad with payload:', adPayload);

        try {
          const adResponse = await axios.post(
            `https://graph.facebook.com/v20.0/act_${fields.adAccountId[0]}/ads`,
            adPayload
          );
          adResponses.push(adResponse.data);
          console.log('Ad created successfully:', adResponse.data);
        } catch (error) {
          console.error('Error creating ad:', error.response?.data || error.message || error);
          return res.status(500).json({ error: 'Failed to create ad.', details: error.response?.data || error.message });
        }
      }

      // Respond with success
      res.status(200).json({ message: 'Campaign and ads created successfully!', adResponses });
    } catch (error) {
      console.error('Unexpected error:', error.message);
      return res.status(500).json({ error: 'Unexpected error.', details: error.message });
    }
  });
}
