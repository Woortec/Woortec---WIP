import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { createClient } from '../../../utils/supabase/client'; // Import Supabase client

export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to upload image to Facebook
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

// Helper function to generate the name with the week of the year and year format
const generateName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const dayOfYear = ((now.getTime() - oneJan.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7); // Calculate the week number
  const yearLastTwoDigits = year.toString().slice(-2);
  return `WOORTEC-W${weekNumber}${yearLastTwoDigits}`;
};

export default async function handler(req, res) {
  console.log('API handler called'); // Log when the handler is invoked

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const form = formidable({
    uploadDir: uploadsDir,
    keepExtensions: true,
    multiples: false, // Ensure multiple files are not handled
  });

  // Promisify form.parse
  const parseForm = (req) =>
    new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

  try {
    const { fields, files } = await parseForm(req);

    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId; // User ID from form (or from any session/auth middleware)
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image; // Image file from form

    // Fetch user data and planOutput from Supabase
    const supabase = createClient();

    try {
      // Fetch Facebook credentials from Supabase
      const { data: facebookData, error: facebookError } = await supabase
        .from('facebookData')
        .select('access_token, account_id, page_id')
        .eq('user_id', userId)
        .single();

      if (facebookError || !facebookData) {
        console.error('Error fetching Facebook credentials from Supabase:', facebookError);
        return res.status(500).json({ error: 'Failed to fetch Facebook credentials from Supabase' });
      }

      const accessToken = facebookData.access_token;
      const adAccountId = facebookData.account_id.replace('act_', ''); // Remove "act_" prefix
      const pageId = facebookData.page_id;

      // Fetch campaign_name and label_one from Supabase
      const { data: planOutputData, error: planOutputError } = await supabase
        .from('facebook_campaign_data')
        .select('strategy_data, campaign_name, label_one')
        .eq('user_id', userId)
        .single();

      if (planOutputError || !planOutputData) {
        console.error('Error fetching plan output from Supabase:', planOutputError);
        return res.status(500).json({ error: 'Failed to fetch plan output from Supabase' });
      }

      const planOutput = planOutputData.strategy_data;
      const campaign_name_from_db = planOutputData.campaign_name;
      const label_one_from_db = planOutputData.label_one;

      // Fetch adLink and objective from ads_strategy table in Supabase
      const { data: adStrategyData, error: adStrategyError } = await supabase
        .from('ads_strategy')
        .select('traffic_url, objective')
        .eq('user_id', userId)
        .single();

      if (adStrategyError || !adStrategyData) {
        console.error('Error fetching ad link from ads_strategy:', adStrategyError);
        return res.status(500).json({ error: 'Failed to fetch ad link from ads_strategy' });
      }

      const adLink = adStrategyData.traffic_url;
      if (!adLink) {
        return res.status(400).json({ error: 'Missing adLink in ads_strategy' });
      }

      // Determine Facebook campaign objective based on the user's selected strategy
      let facebookObjective;
      switch (adStrategyData.objective) {
        case 'Brand Awareness':
          facebookObjective = 'OUTCOME_AWARENESS';
          break;
        case 'Sales':
          facebookObjective = 'OUTCOME_TRAFFIC';
          break;
        case 'Lead Generation':
          facebookObjective = 'OUTCOME_ENGAGEMENT';
          break;
        default:
          return res.status(400).json({ error: 'Invalid campaign objective' });
      }

      // Ensure image file is valid
      if (!imageFile) {
        return res.status(400).json({ error: 'No image file found' });
      }

      // Step 1: Upload the image to Facebook
      const imagePath = imageFile.filepath || imageFile.path;
      const imageUploadResponse = await uploadImageToFacebook(accessToken, adAccountId, imagePath);
      const imageHash = imageUploadResponse.images[Object.keys(imageUploadResponse.images)[0]].hash;

      // Generate base name
      const baseName = generateName();

      // Step 2: Create Campaign
      const campaignName = `${baseName} ${campaign_name_from_db}`;
      const campaignPayload = {
        name: campaignName,
        objective: facebookObjective, // Set the objective based on user strategy
        status: 'PAUSED',
        special_ad_categories: 'NONE',
        access_token: accessToken,
      };
      console.log('Campaign payload:', campaignPayload);

      // Before creating the campaign, check if a campaign with the same name already exists
      const existingCampaignsResponse = await axios.get(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/campaigns`,
        {
          params: {
            access_token: accessToken,
            fields: 'name',
          },
        }
      );

      const existingCampaigns = existingCampaignsResponse.data.data;
      const campaignExists = existingCampaigns.some(campaign => campaign.name === campaignName);

      if (campaignExists) {
        console.log('Campaign with the same name already exists. Skipping campaign creation.');
        return res.status(200).json({ message: 'Campaign already exists. Skipping creation.' });
      }

      const campaignResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/campaigns`,
        campaignPayload
      );
      const campaignId = campaignResponse.data.id;

      // Step 3: Create Ad Set
      const adSetName = `${baseName} ${label_one_from_db}`;
      const adSetPayload = {
        name: adSetName,
        daily_budget: 6000, // Minimum daily budget in cents for ₱60.00
        currency: 'PHP',
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
      const adSetResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/adsets`,
        adSetPayload
      );
      const adSetId = adSetResponse.data.id;

      // Step 4: Create Ad Creative
      const adCreativePayload = {
        name: `${campaignName} - Creative`,
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
              enroll_status: 'OPT_OUT',
            },
          },
        },
        access_token: accessToken,
      };
      const creativeResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/adcreatives`,
        adCreativePayload
      );
      const creativeId = creativeResponse.data.id;

      // Step 5: Create Ad
      const adPayload = {
        name: `${baseName} ${label_one_from_db}`,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: 'PAUSED',
        access_token: accessToken,
      };
      const adResponse = await axios.post(
        `https://graph.facebook.com/v20.0/act_${adAccountId}/ads`,
        adPayload
      );

      res.status(200).json({ message: 'Campaign created successfully!', adResponse: adResponse.data });
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data || error.message || error);
      res.status(500).json({ error: 'Failed to create campaign.', details: error.response?.data || error.message });
    }
  } catch (err) {
    console.error('Error parsing the form data:', err);
    res.status(400).json({ error: 'Error parsing the form data' });
  }
}
