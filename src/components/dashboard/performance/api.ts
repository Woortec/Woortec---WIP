/// api.ts

import axios from 'axios';

export const getItemWithExpiry = (key: string) => {
  if (typeof window !== 'undefined') {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }
  return null;
};

export const setItemWithExpiry = (key: string, value: any, expiry: number) => {
  if (typeof window !== 'undefined') {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + expiry
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
};

export const fetchAdData = async () => {
  const accessToken = getItemWithExpiry('fbAccessToken');
  const adAccountId = getItemWithExpiry('fbAdAccount');

  if (!accessToken || !adAccountId) {
    console.error('Access token or ad account ID not found');
    return { adData: [], currency: 'USD' };
  }

  try {
    const accountResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${adAccountId}`,
      {
        params: {
          access_token: accessToken,
          fields: 'currency',
        },
      }
    );
    const adCurrency = accountResponse.data.currency;

    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${adAccountId}/adsets`,
      {
        params: {
          access_token: accessToken,
          fields: 'id,name',
        },
      }
    );

    const adSetIds = response.data.data.map((adSet: any) => adSet.id);
    const adSetNames = response.data.data.reduce((acc: { [key: string]: string }, adSet: any) => {
      acc[adSet.id] = adSet.name;
      return acc;
    }, {});

    const insightsResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${adAccountId}/insights`,
      {
        params: {
          access_token: accessToken,
          fields: 'adset_id,cpm,cpc,impressions,spend',
          date_preset: 'last_30d',
          level: 'adset'
        },
      }
    );

    const insights = insightsResponse.data.data.map((insight: any) => ({
      ...insight,
      name: adSetNames[insight.adset_id],
    }));

    return { adData: insights, currency: adCurrency };
  } catch (error) {
    console.error('Error fetching ad set data:', error);
    return { adData: [], currency: 'USD' };
  }
};

export const fetchAdSetDetail = async (adSetId: string) => {
  const accessToken = getItemWithExpiry('fbAccessToken');

  if (!accessToken) {
    console.error('Access token not found');
    return null;
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${adSetId}`,
      {
        params: {
          access_token: accessToken,
          fields: 'id,name,cpm,cpc,impressions,spend', // Add any other fields you want
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching ad set detail:', error);
    return null;
  }
};
