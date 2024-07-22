import { NextApiRequest, NextApiResponse } from 'next';
import { fetchFacebookAdData } from '../../lib/facebook';
import { sendToKlaviyo } from '../../lib/klaviyo';

const syncFacebookData = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, userId, email, adAccountId } = req.body;

  if (!token || !email || !adAccountId) {
    return res.status(400).json({ error: 'Missing required parameters: token, email, or adAccountId' });
  }

  console.log(`Processing request for userId: ${userId}, email: ${email}, adAccountId: ${adAccountId}`);

  try {
    console.log('Fetching data from Facebook...');
    const adData = await fetchFacebookAdData(token, adAccountId);

    if (!adData || adData.length === 0) {
      console.error('No ad data received from Facebook');
      return res.status(500).json({ error: 'No ad data received from Facebook' });
    }

    console.log(`Fetched ad data: ${JSON.stringify(adData)}`);

    const properties = {
      impressions: adData[0].impressions,
      clicks: adData[0].clicks,
      spend: adData[0].spend,
      ctr: adData[0].ctr,
      cpc: adData[0].cpc,
      reach: adData[0].reach,
    };

    console.log(`Sending data to Klaviyo for email: ${email}, properties: ${JSON.stringify(properties)}`);
    await sendToKlaviyo(email, properties);

    res.status(200).json({ message: 'Data fetched and sent to Klaviyo successfully' });
  } catch (error) {
    console.error('Error occurred:', error);

    const err = error as any; // Cast error to any type

    if (err.response) {
      // If the error has a response from the API
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      console.error('Error response headers:', err.response.headers);
      return res.status(500).json({ error: err.response.data });
    } else if (err.request) {
      // If the error was a request but no response was received
      console.error('Error request data:', err.request);
      return res.status(500).json({ error: 'No response received from external API' });
    } else {
      // Something else happened in setting up the request
      console.error('Error message:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }
};

export default syncFacebookData;
