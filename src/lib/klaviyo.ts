import axios from 'axios';

const klaviyoApiKey = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
const klaviyoListId = 'TEST (EMAILS) MARKETING API'; // Replace with your list ID

export const sendToKlaviyo = async (email: string, properties: object) => {
  const url = `https://a.klaviyo.com/api/v2/list/${klaviyoListId}/members`;
  try {
    const response = await axios.post(url, {
      api_key: klaviyoApiKey,
      profiles: [
        {
          email: email,
          properties: properties,
        },
      ],
    });
    return response.data;
  } catch (error) {
    console.error('Error sending data to Klaviyo:', error);
    throw error;
  }
};
