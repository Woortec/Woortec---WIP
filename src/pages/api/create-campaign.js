import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadImageToFacebook = async (accessToken, adAccountId, imagePath) => {
  const formData = new FormData();
  formData.append('access_token', accessToken);
  formData.append('file', fs.createReadStream(imagePath));

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/act_${adAccountId}/adimages`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading image to Facebook:', error.response?.data || error.message || error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Ensure the uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const form = formidable({
    uploadDir: uploadsDir,
    keepExtensions: true,
    multiples: false, // Ensure multiple files are not handled
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form data:', err);
      return res.status(400).json({ error: 'Error parsing the form data' });
    }

    const {
      accessToken: [accessToken],
      adAccountId: [adAccountId],
      pageId: [pageId],
      labelOne: [labelOne],
      labelTwo: [labelTwo],
    } = fields;

    let planOutput;
    try {
      planOutput = JSON.parse(fields.planOutput[0]);
    } catch (e) {
      console.error('Error parsing planOutput:', e);
      return res.status(400).json({ error: 'Invalid planOutput format' });
    }

    // Fetch adLink from planOutput.campaignDetails
    const adLink = planOutput.campaignDetails?.adLink;
    if (!adLink) {
      return res.status(400).json({ error: 'Missing adLink in campaignDetails of planOutput' });
    }

    // Ensure only one file is handled
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    console.log('Received fields:', fields);
    console.log('Received planOutput:', planOutput);
    console.log('Received files:', files);
    console.log('Received image:', imageFile);

    if (!accessToken || !adAccountId || !pageId || !planOutput || !imageFile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Ensure image path is valid
      const imagePath = imageFile.filepath || imageFile.path;
      console.log('Image path:', imagePath);
      if (!imagePath) {
        console.error('Image path is undefined');
        return res.status(400).json({ error: 'Invalid image path' });
      }

      // Step 1: Upload the image to Facebook
      const imageUploadResponse = await uploadImageToFacebook(accessToken, adAccountId, imagePath);
      const imageHash = imageUploadResponse.images[Object.keys(imageUploadResponse.images)[0]].hash;

      // Step 2: Create Campaign
      const campaignPayload = {
        name: `${labelOne} ${labelTwo}`,
        objective: 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
        special_ad_categories: 'NONE', // Changed from array to string
        access_token: accessToken,
      };
      console.log('Campaign payload:', campaignPayload);
      const campaignResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/campaigns`,
        campaignPayload
      );
      console.log('Campaign response:', campaignResponse.data);
      const campaignId = campaignResponse.data.id;

      // Step 3: Create Ad Set
      const adSetPayload = {
        name: 'New Ad Set',
        daily_budget: 6000, // Minimum daily budget in cents for ₱60.00
        currency: 'PHP', // Specifying the currency as PHP (Philippine Peso)
        start_time: new Date().toISOString(),
        end_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        campaign_id: campaignId,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'REACH',
        bid_strategy: 'LOWEST_COST_WITH_BID_CAP',
        bid_amount: 500,
        targeting: {
          geo_locations: { countries: ['PH'] },
          age_min: 18,
          age_max: 65,
          genders: [1, 2],
        },
        status: 'PAUSED',
        access_token: accessToken,
      };
      console.log('Ad Set payload:', adSetPayload);
      const adSetResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/adsets`,
        adSetPayload
      );
      console.log('Ad Set response:', adSetResponse.data);
      const adSetId = adSetResponse.data.id;

      // Step 4: Create Ad Creative
      const adCreativePayload = {
        name: 'Ad Creative',
        object_story_spec: {
          page_id: pageId,
          link_data: {
            link: adLink,
            image_hash: imageHash,
          },
        },
        degrees_of_freedom_spec: {
          creative_features_spec: {
            standard_enhancements: {
              enroll_status: 'OPT_OUT'
            }
          }
        },
        access_token: accessToken,
      };
      console.log('Ad Creative payload:', adCreativePayload);
      const creativeResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/adcreatives`,
        adCreativePayload
      );
      console.log('Ad Creative response:', creativeResponse.data);
      const creativeId = creativeResponse.data.id;

      // Step 5: Create Ad
      const adPayload = {
        name: 'New Ad',
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: 'PAUSED',
        access_token: accessToken,
      };
      console.log('Ad payload:', adPayload);
      const adResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/ads`,
        adPayload
      );
      console.log('Ad response:', adResponse.data);

      res.status(200).json({ message: 'Campaign created successfully!', adResponse: adResponse.data });
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data || error.message || error);
      res.status(500).json({ error: 'Failed to create campaign.', details: error.response?.data || error.message });
    }
  });
}
