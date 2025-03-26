import axios from 'axios';
import { createClient } from '../../../utils/supabase/client'; // Import Supabase client

export const config = {
  api: {
    bodyParser: true, // ✅ Keep bodyParser enabled to parse JSON payload
  },
};

export default async function handler(req, res) {
  console.log('API handler called'); // Debugging log

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, imageUrl, labelOne, labelTwo, campaignName } = req.body; // ✅ Expecting imageFile

    if (!userId || !imageUrl || !labelOne || !labelTwo || !campaignName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabase = createClient();

    // ✅ Fetch Facebook credentials from Supabase
    const { data: facebookData, error: facebookError } = await supabase
      .from('facebookData')
      .select('access_token, account_id, page_id')
      .eq('user_id', userId)
      .single();

    if (facebookError || !facebookData) {
      return res.status(500).json({ error: 'Failed to fetch Facebook credentials' });
    }

    const { access_token: accessToken, account_id: adAccountId, page_id: pageId } = facebookData;

    // ✅ Fetch adLink and objective from ads_strategy table
    const { data: adStrategyData, error: adStrategyError } = await supabase
      .from('ads_strategy')
      .select('traffic_url, objective')
      .eq('user_id', userId)
      .single();

    if (adStrategyError || !adStrategyData) {
      return res.status(500).json({ error: 'Failed to fetch ad link' });
    }

    const adLink = adStrategyData.traffic_url;
    if (!adLink) {
      return res.status(400).json({ error: 'Missing adLink in ads_strategy' });
    }

    // ✅ Set Facebook campaign objective
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

    const imagePath = imageUrl; // ✅ Use imageUrl directly, no need for upload


// ✅ Helper function to generate the name with the week of the year and year format
const generateName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const dayOfYear = ((now.getTime() - oneJan.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7); // Calculate the week number
  const yearLastTwoDigits = year.toString().slice(-2);
  return `WOORTEC-W${weekNumber}${yearLastTwoDigits}`;
};

// ✅ Use the function in your handler:
const baseName = generateName();
const campaignFinalName = `${baseName} ${campaignName}`;



    console.log('Campaign name:', campaignFinalName);

    // ✅ Check if the campaign already exists
    const existingCampaignsResponse = await axios.get(
      `https://graph.facebook.com/v20.0/${adAccountId}/campaigns`,
      {
        params: {
          access_token: accessToken,
          fields: 'name',
        },
      }
    );

    const existingCampaigns = existingCampaignsResponse.data.data;
    const campaignExists = existingCampaigns.some((campaign) => campaign.name === campaignFinalName);

    if (campaignExists) {
      console.log('Campaign already exists. Skipping creation.');
      return res.status(200).json({ message: 'Campaign already exists. Skipping creation.' });
    }

    // ✅ Create Campaign
    const campaignPayload = {
      name: campaignFinalName,
      objective: facebookObjective,
      status: 'PAUSED',
      special_ad_categories: 'NONE',
      access_token: accessToken,
    };

    const campaignResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${adAccountId}/campaigns`,
      campaignPayload
    );
    const campaignId = campaignResponse.data.id;

    // ✅ Create Ad Set
    const adSetName = `${baseName} ${labelOne}`;
    const adSetPayload = {
      name: adSetName,
      daily_budget: 6000, // ₱60.00 minimum
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
      `https://graph.facebook.com/v20.0/${adAccountId}/adsets`,
      adSetPayload
    );
    const adSetId = adSetResponse.data.id;

    // ✅ Create Ad Creative
    const adCreativePayload = {
      name: `${campaignFinalName} - Creative`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          link: adLink,
          picture: imageUrl,
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
      `https://graph.facebook.com/v20.0/${adAccountId}/adcreatives`,
      adCreativePayload
    );
    const creativeId = creativeResponse.data.id;

    // ✅ Create Ad
    const adPayload = {
      name: `${baseName} ${labelTwo}`,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status: 'PAUSED',
      access_token: accessToken,
    };

    const adResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${adAccountId}/ads`,
      adPayload
    );

    res.status(200).json({ message: 'Campaign created successfully!', adResponse: adResponse.data });
  } catch (error) {
    console.error('❌ Error creating campaign:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to create campaign.', details: error.response?.data || error.message });
  }
}
