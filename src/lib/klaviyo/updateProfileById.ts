import axios from 'axios';

const KLAVIYO_API_KEY = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/profiles';

export const updateProfileById = async (profileId: string, customFields: any) => {
  const url = `${KLAVIYO_API_URL}/${profileId}`;
  const options = {
    method: 'PATCH',
    url: url,
    headers: {
      accept: 'application/json',
      revision: '2024-07-15', // Use the latest date of revision according to Klaviyo's API documentation
      'content-type': 'application/json',
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    },
    data: {
      data: {
        type: 'profile',
        id: profileId,
        attributes: {
          properties: customFields,
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
