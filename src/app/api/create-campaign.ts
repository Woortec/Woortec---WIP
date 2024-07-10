// pages/api/create-campaign.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const FB_GRAPH_API_URL = 'https://graph.facebook.com/v19.0';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { planOutput, accessToken, userId, fbPage, adMessage, adLink, adImageUrl } = req.body;

    if (!accessToken || !userId || !fbPage || !adMessage || !adLink || !adImageUrl) {
      return res.status(400).json({ message: 'Missing required information.' });
    }

    const adAccountId = `act_${userId}`; // Construct adAccountId using the userId

    try {
      // Step 1: Create Campaign
      const campaignResponse = await axios.post(
        `${FB_GRAPH_API_URL}/${adAccountId}/campaigns`,
        {
          name: 'Campaign from Plan',
          objective: 'LINK_CLICKS',
          status: 'PAUSED'
        },
        {
          params: { access_token: accessToken }
        }
      );
      const campaignId = campaignResponse.data.id;

      // Step 2: Create Ad Sets and Ads
      for (const level of planOutput) {
        // Create Ad Set
        const adSetResponse = await axios.post(
          `${FB_GRAPH_API_URL}/${adAccountId}/adsets`,
          {
            name: `Ad Set - ${level.plansWeek}`,
            campaign_id: campaignId,
            daily_budget: Math.round(level.investAmount),
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LINK_CLICKS',
            targeting: { geo_locations: { countries: ['US'] } },
            start_time: new Date(level.startingDay).toISOString(),
            end_time: new Date(new Date(level.startingDay).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            params: { access_token: accessToken }
          }
        );
        const adSetId = adSetResponse.data.id;

        // Create Ad Creative
        const adCreativeResponse = await axios.post(
          `${FB_GRAPH_API_URL}/${adAccountId}/adcreatives`,
          {
            name: `Creative - ${level.plansWeek}`,
            object_story_spec: {
              page_id: fbPage,
              link_data: {
                message: adMessage,
                link: adLink,
                image_url: adImageUrl
              }
            }
          },
          {
            params: { access_token: accessToken }
          }
        );
        const adCreativeId = adCreativeResponse.data.id;

        // Create Ads
        for (let i = 0; i < level.numberOfAds; i++) {
          await axios.post(
            `${FB_GRAPH_API_URL}/${adAccountId}/ads`,
            {
              name: `Ad - ${level.plansWeek} - ${i + 1}`,
              adset_id: adSetId,
              creative: { creative_id: adCreativeId },
              status: 'PAUSED'
            },
            {
              params: { access_token: accessToken }
            }
          );
        }
      }

      res.status(200).json({ message: 'Campaign created successfully!' });
    } catch (error: unknown) {
      console.error('Error creating campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'Failed to create campaign.', error: errorMessage });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
