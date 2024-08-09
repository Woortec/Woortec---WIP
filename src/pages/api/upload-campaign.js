import axios from 'axios';

export const config = {
  api: {
    bodyParser: true,  // Enable bodyParser to handle the incoming JSON data
  },
};

const uploadImageToFacebook = async (accessToken, adAccountId, imageUrl) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v20.0/act_${adAccountId}/adimages`,
      params: {
        access_token: accessToken,
        url: imageUrl,
      },
    });
    return response.data.images[Object.keys(response.data.images)[0]].hash;
  } catch (error) {
    console.error('Error uploading image to Facebook:', error.response?.data || error.message || error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken, adAccountId, pageId, planOutput } = req.body;

    if (!accessToken || !adAccountId || !pageId || !planOutput) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let parsedPlanOutput;
    try {
      parsedPlanOutput = JSON.parse(planOutput); // Parse the planOutput JSON string
    } catch (e) {
      console.error('Error parsing planOutput:', e);
      return res.status(400).json({ error: 'Invalid planOutput format' });
    }

    // Check for the adLink within campaignDetails
    const adLink = parsedPlanOutput.campaignDetails?.adLink;
    if (!adLink) {
      return res.status(400).json({ error: 'Missing adLink in campaignDetails of planOutput' });
    }

    // Placeholder image URL
    const imageHash = 'b018e87a45dab5bbf1cbdae485619a31';

    // Step 1: Create Campaign
    const campaignPayload = {
      name: 'Woortec ',
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      special_ad_categories: 'NONE',
      access_token: accessToken,
    };
    const campaignResponse = await axios.post(
      `https://graph.facebook.com/v20.0/act_${adAccountId}/campaigns`,
      campaignPayload
    );
    const campaignId = campaignResponse.data.id;

    // Step 2: Create Ad Set
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
    const adSetResponse = await axios.post(
      `https://graph.facebook.com/v20.0/act_${adAccountId}/adsets`,
      adSetPayload
    );
    const adSetId = adSetResponse.data.id;

    // Step 3: Create Ad Creative
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

    // Step 4: Create Ad
    const adPayload = {
      name: 'New Ad',
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
}
