import axios from 'axios';

const KLAVIYO_API_KEY = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/profiles';

export const fetchProfileByEmail = async (email: string) => {
  const url = `${KLAVIYO_API_URL}?filter=equals(email,"${email}")`;
  const options = {
    method: 'GET',
    url: url,
    headers: {
      accept: 'application/json',
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      revision: '2023-07-15', // Use the latest date of revision according to Klaviyo's API documentation
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    } else {
      return null;
    }
  } catch (error) {
    const err = error as any;
    console.error('Error fetching profile by email in Klaviyo:', err.response ? err.response.data : err.message);
    throw err;
  }
};
