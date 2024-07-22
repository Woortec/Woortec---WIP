import { NextApiRequest, NextApiResponse } from 'next';
import { fetchFacebookAdData } from '../../lib/facebook';
import { sendToKlaviyo } from '../../lib/klaviyo';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { token, userId, email } = req.body; // Assuming you pass these in the request body

  try {
    const adData = await fetchFacebookAdData(token);

    const properties = {
      impressions: adData.impressions,
      clicks: adData.clicks,
      likes: adData.likes,
    };

    await sendToKlaviyo(email, properties);

    res.status(200).json({ message: 'Data fetched and sent to Klaviyo successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data or sending to Klaviyo' });
  }
};
