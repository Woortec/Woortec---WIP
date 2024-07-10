import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { accessToken, adAccountId, pageId, adMessage, adLink, adImageUrl, planOutput } = req.body;

    console.log('Received accessToken:', accessToken);
    console.log('Received adAccountId:', adAccountId);
    console.log('Received pageId:', pageId);
    console.log('Received adMessage:', adMessage);
    console.log('Received adLink:', adLink);
    console.log('Received adImageUrl:', adImageUrl);
    console.log('Received planOutput:', planOutput);

    if (!accessToken || !adAccountId || !pageId || !adMessage || !adLink || !adImageUrl || !planOutput) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Step 1: Upload Image to Facebook
      const imageResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_${adAccountId}/adimages`,
        {
          url: adImageUrl,
          access_token: accessToken,
        }
      );
      console.log('Image upload response:', imageResponse.data);
      const imageHash = imageResponse.data.images[0].hash;

      // Step 2: Create Campaign
      const campaignResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns`,
        {
          name: 'New Campaign',
          objective: 'OUTCOME_TRAFFIC',
          status: 'PAUSED',
          special_ad_categories: ['NONE'],
          access_token: accessToken,
        }
      );
      console.log('Campaign response:', campaignResponse.data);
      const campaignId = campaignResponse.data.id;

      // Step 3: Create Ad Set
      const adSetResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_${adAccountId}/adsets`,
        {
          name: 'New Ad Set',
          daily_budget: 1000,
          start_time: new Date().toISOString(),
          end_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          campaign_id: campaignId,
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'REACH',
          bid_strategy: 'LOWEST_COST_WITH_BID_CAP',
          bid_amount: 500,
          targeting: {
            geo_locations: { countries: ['US'] },
            age_min: 18,
            age_max: 65,
            genders: [1, 2],
          },
          status: 'PAUSED',
          access_token: accessToken,
        }
      );
      console.log('Ad Set response:', adSetResponse.data);
      const adSetId = adSetResponse.data.id;

      // Step 4: Create Ad Creative
      const creativeResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_${adAccountId}/adcreatives`,
        {
          name: 'Ad Creative',
          title: adMessage,
          body: adMessage,
          object_url: adLink,
          link: adLink,
          image_hash: imageHash,
          access_token: accessToken,
        }
      );
      console.log('Ad Creative response:', creativeResponse.data);
      const creativeId = creativeResponse.data.id;

      // Step 5: Create Ad
      const adResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_${adAccountId}/ads`,
        {
          name: 'New Ad',
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: 'PAUSED',
          access_token: accessToken,
        }
      );
      console.log('Ad response:', adResponse.data);

      res.status(200).json({ message: 'Campaign created successfully!', adResponse: adResponse.data });
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data || error.message || error);
      res.status(500).json({ error: 'Failed to create campaign.', details: error.response?.data || error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
