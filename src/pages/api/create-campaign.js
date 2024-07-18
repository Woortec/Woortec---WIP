import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { accessToken, adAccountId, pageId, adMessage, adLink, planOutput } = req.body;

    console.log('Received accessToken:', accessToken);
    console.log('Received adAccountId:', adAccountId);
    console.log('Received pageId:', pageId);
    console.log('Received adMessage:', adMessage);
    console.log('Received adLink:', adLink);
    console.log('Received planOutput:', planOutput);

    if (!accessToken || !adAccountId || !pageId || !adMessage || !adLink || !planOutput) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Step 1: Use the provided image hash and URL
      const imageHash = 'b018e87a45dab5bbf1cbdae485619a31';
      const adImageUrl = 'https://scontent.fmnl17-6.fna.fbcdn.net/v/t45.1600-4/440577696_120208771426510495_1603868053635812846_n.png?stp=dst-jpg&_nc_cat=109&ccb=1-7&_nc_sid=890911&_nc_ohc=Pnw46aIpLxwQ7kNvgE_Js2y&_nc_ht=scontent.fmnl17-6.fna&edm=AP4hL3IEAAAA&oh=00_AYAeObXrcoIwYJsq8ZN_kCz-xfGtpToHFXP6ap9fz5SLZw&oe=669BE1E4';

      // Step 2: Create Campaign
      const campaignResponse = await axios.post(
        `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns`,
        {
          name: 'TEST',
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
            geo_locations: { countries: ['PH'] }, // Changed to Philippines for the PHP currency
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
          object_story_spec: {
            page_id: pageId,
            link_data: {
              message: adMessage,
              link: adLink,
              image_hash: imageHash
            }
          },
          degrees_of_freedom_spec: {
            creative_features_spec: {
              standard_enhancements: {
                enroll_status: 'OPT_OUT'
              }
            }
          },
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
