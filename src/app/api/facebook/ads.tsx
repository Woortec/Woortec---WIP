import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessToken } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const response = await axios.get(`https://graph.facebook.com/v19.0/me/adaccounts`, {
      params: {
        fields: 'campaigns{name,adsets{name,insights{spend,impressions,clicks,ctr,cpc,cpm}}}',
        access_token: accessToken,
      },
    });

    const data = response.data;

    console.log('API Data:', data);  // Add this line to log the data

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const adsData = data.data.flatMap((account: any) =>
      account.campaigns?.data.flatMap((campaign: any) =>
        campaign.adsets?.data.map((adset: any) => {
          const insights = adset.insights?.data[0] || {};
          return {
            campaign_name: campaign.name,
            adset_name: adset.name,
            spend: insights.spend || '0',
            impressions: insights.impressions || '0',
            clicks: insights.clicks || '0',
            ctr: insights.ctr || '0',
            cpc: insights.cpc || '0',
            cpm: insights.cpm || '0',
            reach: insights.reach || '0',
              frequency: insights.frequency || '0',
              unique_clicks: insights.unique_clicks || '0',
              unique_ctr: insights.unique_ctr || '0',
          };
        }) || []
      ) || []
    );

    res.status(200).json(adsData);
  } catch (error) {
    console.error('Error fetching ads data:', error);
    res.status(500).json({ error: 'Failed to fetch ads data' });
  }
};

export default handler;
