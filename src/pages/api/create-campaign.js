import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { accessToken, userId, fbPage, adMessage, adLink, adImageUrl, planOutput } = req.body;

    try {
      // Step 1: Create Campaign
      const campaignResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_{AD_ACCOUNT_ID}/campaigns`,
        {
          name: "New Campaign",
          objective: "LINK_CLICKS",
          status: "PAUSED",
          access_token: accessToken,
        }
      );
      const campaignId = campaignResponse.data.id;

      // Step 2: Create Ad Set
      const adSetResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_{AD_ACCOUNT_ID}/adsets`,
        {
          name: "New Ad Set",
          daily_budget: 1000,
          start_time: new Date().toISOString(),
          end_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
          campaign_id: campaignId,
          billing_event: "IMPRESSIONS",
          optimization_goal: "REACH",
          targeting: {
            geo_locations: {
              countries: ["US"],
            },
            age_min: 18,
            age_max: 65,
            genders: [1, 2],
          },
          status: "PAUSED",
          access_token: accessToken,
        }
      );
      const adSetId = adSetResponse.data.id;

      // Step 3: Create Ad Creative
      const creativeResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_{AD_ACCOUNT_ID}/adcreatives`,
        {
          name: "Ad Creative",
          title: adMessage,
          body: adMessage,
          object_url: adLink,
          link: adLink,
          image_url: adImageUrl,
          access_token: accessToken,
        }
      );
      const creativeId = creativeResponse.data.id;

      // Step 4: Create Ad
      const adResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_{AD_ACCOUNT_ID}/ads`,
        {
          name: "New Ad",
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: "PAUSED",
          access_token: accessToken,
        }
      );

      res.status(200).json({ message: 'Campaign created successfully!', adResponse: adResponse.data });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
