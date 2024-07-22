import { NextApiRequest, NextApiResponse } from 'next';
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
    // Directly subscribe the profile to Klaviyo
    await subscribeProfile(email);

    res.status(200).json({ message: 'Profile subscribed to Klaviyo successfully' });
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
