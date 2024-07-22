import axios from 'axios';

const KLAVIYO_API_KEY = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
const LIST_ID = 'XSsStF'; // Replace with your actual Klaviyo list ID
const REVISION = '2024-07-15'; // Use the latest date of revision according to Klaviyo's API

export const subscribeProfile = async (email: string) => {
  console.log('Klaviyo API Key:', KLAVIYO_API_KEY); // Add debug log for API key
  if (!KLAVIYO_API_KEY) {
    throw new Error('Klaviyo API key is not set');
  }

  const url = 'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs';

  const options = {
    method: 'POST',
    url: url,
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
    return response.data;
  } catch (error) {
    const err = error as any;
    console.error('Error subscribing profile in Klaviyo:', err.response ? err.response.data : err.message);
    throw err;
  }
};
