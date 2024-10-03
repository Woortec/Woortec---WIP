import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const KLAVIYO_API_KEY = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs';
const LIST_ID = 'Y8z9xD'; // Replace with your actual list ID
const REVISION = '2024-07-15'; // Use the latest date of revision according to Klaviyo's API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!KLAVIYO_API_KEY) {
    return res.status(500).json({ error: 'Klaviyo API key is not set' });
  }

  const options = {
    method: 'POST',
    url: KLAVIYO_API_URL,
    headers: {
      accept: 'application/json',
      revision: REVISION,
      'content-type': 'application/json',
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    },
    data: {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          custom_source: 'Facebook Sync',
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email: email,
                },
              },
            ],
          },
          historical_import: false,
        },
        relationships: { list: { data: { type: 'list', id: LIST_ID } } },
      },
    },
  };

  try {
    const response = await axios.request(options);
    console.log('Response from Klaviyo:', response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    const err = error as any;
    console.error('Error subscribing profile in Klaviyo:', err.response ? err.response.data : err.message);
    return res.status(500).json({ error: err.message });
  }
}
