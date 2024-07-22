import axios from 'axios';

const KLAVIYO_API_KEY = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/v2/profiles';

export const updateProfile = async (email: string, customFields: any) => {
  console.log('Klaviyo API Key:', KLAVIYO_API_KEY); // Add debug log for API key
  if (!KLAVIYO_API_KEY) {
    throw new Error('Klaviyo API key is not set');
  }

  const url = `${KLAVIYO_API_URL}/${email}`;
  const options = {
    method: 'PATCH',
    url: url,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    },
    data: {
      data: {
        type: 'profile',
        attributes: {
          email: email,
          ...customFields,
        },
      },
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    const err = error as any;
    console.error('Error updating profile in Klaviyo:', err.response ? err.response.data : err.message);
    throw err;
  }
};
