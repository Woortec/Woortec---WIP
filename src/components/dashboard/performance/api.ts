import axios from 'axios';

let cachedAdData: any[] = [];
let cachedCurrency: string = 'USD';
let dataFetched: boolean = false;

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
      `https://graph.facebook.com/v20.0/${adAccountId}`,
      {
        params: {
          access_token: accessToken,
          fields: 'currency',
        },
      }
    );
    const adCurrency = accountResponse.data.currency;

    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${adAccountId}/adsets`,
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
      `https://graph.facebook.com/v20.0/${adAccountId}/insights`,
      {
        params: {
          access_token: accessToken,
          fields: 'adset_id,cpm,cpc,impressions,spend',
          date_preset: 'last_30d',
          level: 'adset'
        },
      }
    );

    const insights = await Promise.all(insightsResponse.data.data.map(async (insight: any) => {
      const adCreativeResponse = await axios.get(
        `https://graph.facebook.com/v20.0/${adAccountId}/adcreatives`,
        {
          params: {
            access_token: accessToken,
            fields: 'object_story_spec{link_data{image_hash}},image_hash',
            ad_set_id: insight.adset_id, // Include ad_set_id to filter results
          },
        }
      );

      const adCreative = adCreativeResponse.data.data.find((creative: any) => creative.object_story_spec?.link_data?.image_hash);
      console.log('Ad Creative Data:', adCreative); // Log the full creative object

      let imageUrl = null;

      const imageHash = adCreative?.object_story_spec?.link_data?.image_hash || adCreative?.image_hash;

      if (imageHash) {
        console.log(`Fetching image for hash: ${imageHash}`);
        const imageResponse = await axios.get(
          `https://graph.facebook.com/v20.0/${adAccountId}/adimages`,
          {
            params: {
              access_token: accessToken,
              hashes: [imageHash], // Pass the image hash as an array
              fields: 'url',
            },
          }
        );

        const imagesData = imageResponse.data.data;
        if (imagesData.length > 0 && imagesData[0].url) {
          imageUrl = imagesData[0].url;
          console.log(`Fetched image URL: ${imageUrl}`);
        } else {
          console.error('No image URL found for image hash:', imageHash);
        }
      }

      return {
        ...insight,
        name: adSetNames[insight.adset_id],
        imageUrl: imageUrl,
      };
    }));

    return { adData: insights, currency: adCurrency };
  } catch (error) {
    console.error('Error fetching ad set data:', error);
    return { adData: [], currency: 'USD' };
  }
};
