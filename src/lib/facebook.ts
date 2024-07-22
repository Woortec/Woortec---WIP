import axios from 'axios';

export const fetchFacebookAdData = async (accessToken: string) => {
  const url = `https://graph.facebook.com/v19.0/me/insights`; // Replace with actual endpoint
  try {
    const response = await axios.get(url, {
      params: {
        access_token: accessToken,
        fields: 'impressions,clicks,likes',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Facebook:', error);
    throw error;
  }
};