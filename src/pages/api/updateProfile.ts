import { NextApiRequest, NextApiResponse } from 'next';
import { fetchFacebookAdData } from '../../lib/facebook';
import { fetchProfileByEmail } from '../../lib/klaviyo/fetchProfileByEmail';
import { updateProfileById } from '../../lib/klaviyo/updateProfileById';

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
    const adDataArray = await fetchFacebookAdData(token, adAccountId);

    if (!adDataArray || adDataArray.length === 0) {
      console.error('No ad data received from Facebook');
      res.status(500).json({ error: 'No ad data received from Facebook' });
      return;
    }

    const adData = adDataArray[0];  // Access the first element of the array

    console.log('Fetched ad data:', adData);

    const customFields = {
      source: 'Facebook ASD',
      impressions: parseInt(adData.impressions) || 0,
      clicks: parseInt(adData.clicks) || 0,
      spend: parseFloat(adData.spend) || 0,
      ctr: parseFloat(adData.ctr) || 0,
      cpc: parseFloat(adData.cpc) || 0,
      reach: parseInt(adData.reach) || 0,
    };

    const profile = await fetchProfileByEmail(email);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const profileId = profile.id;

    await updateProfileById(profileId, customFields);

    res.status(200).json({ message: 'Profile updated with custom fields in Klaviyo successfully' });
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
