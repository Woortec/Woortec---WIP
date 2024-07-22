import { NextApiRequest, NextApiResponse } from 'next';
import { fetchFacebookAdData } from '../../lib/facebook';
import { subscribeProfile } from '../../lib/klaviyo';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { token, userId, email, adAccountId } = req.body;

  if (!token || !email || !adAccountId) {
    res.status(400).json({ error: 'Missing required parameters: token, email, or adAccountId' });
    return;
  }

  console.log(`Processing request for userId: ${userId}, email: ${email}, adAccountId: ${adAccountId}`);

  try {
    const adData = await fetchFacebookAdData(token, adAccountId);

    if (!adData || adData.length === 0) {
      console.error('No ad data received from Facebook');
      res.status(500).json({ error: 'No ad data received from Facebook' });
      return;
    }

    await subscribeProfile(email);

    res.status(200).json({ message: 'Data fetched and sent to Klaviyo successfully' });
  } catch (error) {
    const err = error as any;
    console.error('Error occurred:', err);

    if (err.response) {
      res.status(500).json({ error: err.response.data });
    } else if (err.request) {
      res.status(500).json({ error: 'No response received from external API' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

export default handler;
