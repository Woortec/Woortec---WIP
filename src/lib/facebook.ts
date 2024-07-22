import axios from 'axios';

export const fetchFacebookAdData = async (accessToken: string, adAccountId: string) => {
  const url = `https://graph.facebook.com/v20.0/${adAccountId}/insights`;
  try {
    const response = await axios.get(url, {
      params: {
        access_token: accessToken,
        fields: 'impressions,clicks,likes',
      },
    });
    return response.data.data; // The insights data is usually nested under 'data'
  } catch (error) {
    console.error('Error fetching data from Facebook:', error);
    throw error;
  }
};
