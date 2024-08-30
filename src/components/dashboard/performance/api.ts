import axios from 'axios';

let cachedAdData: any[] = [];
let cachedCurrency: string = 'USD';
let dataFetched: boolean = false;
let cachedThreadId: string | null = null;
let cachedRunId: string | null = null;
let cachedAIResponse: string | null = null;

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
      expiry: now.getTime() + expiry,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
};

export const fetchAdData = async () => {
  if (dataFetched && cachedAdData.length > 0) {
    return { adData: cachedAdData, currency: cachedCurrency };
  }

  const accessToken = getItemWithExpiry('fbAccessToken');
  const adAccountId = getItemWithExpiry('fbAdAccount');

  if (!accessToken || !adAccountId) {
    console.error('Access token or ad account ID not found');
    return { adData: [], currency: 'USD' };
  }

  try {
    const accountResponse = await axios.get(`https://graph.facebook.com/v20.0/${adAccountId}`, {
      params: {
        access_token: accessToken,
        fields: 'currency',
      },
    });
    cachedCurrency = accountResponse.data.currency;

    const response = await axios.get(`https://graph.facebook.com/v20.0/${adAccountId}/adsets`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,status',
      },
    });

    // Filter active ad sets
    const activeAdSets = response.data.data.filter((adSet: any) => adSet.status === 'ACTIVE');
    const adSetIds = activeAdSets.map((adSet: any) => adSet.id);
    const adSetNames = activeAdSets.reduce((acc: { [key: string]: string }, adSet: any) => {
      acc[adSet.id] = adSet.name;
      return acc;
    }, {});

    const insightsResponse = await axios.get(`https://graph.facebook.com/v20.0/${adAccountId}/insights`, {
      params: {
        access_token: accessToken,
        fields: 'adset_id,cpm,cpc,impressions,spend,actions',
        date_preset: 'last_7d',
        level: 'adset',
        limit: 100,
      },
    });

    const insights = await Promise.all(
      insightsResponse.data.data.map(async (insight: any) => {
        const adCreativeResponse = await axios.get(
          `https://graph.facebook.com/v20.0/${adAccountId}/adcreatives`,
          {
            params: {
              access_token: accessToken,
              fields: 'object_story_spec{link_data{image_hash}},image_hash',
              ad_set_id: insight.adset_id,
            },
          }
        );

        const adCreative = adCreativeResponse.data.data.find(
          (creative: any) => creative.object_story_spec?.link_data?.image_hash
        );

        let imageUrl = null;

        const imageHash = adCreative?.object_story_spec?.link_data?.image_hash || adCreative?.image_hash;

        if (imageHash) {
          const imageResponse = await axios.get(
            `https://graph.facebook.com/v20.0/${adAccountId}/adimages`,
            {
              params: {
                access_token: accessToken,
                hashes: [imageHash],
                fields: 'url',
              },
            }
          );

          const imagesData = imageResponse.data.data;
          if (imagesData.length > 0 && imagesData[0].url) {
            imageUrl = imagesData[0].url;
          }
        }

        return {
          ...insight,
          name: adSetNames[insight.adset_id],
          imageUrl: imageUrl,
        };
      })
    );

    cachedAdData = insights;
    dataFetched = true;
    return { adData: insights, currency: cachedCurrency };
  } catch (error) {
    console.error('Error fetching ad set data:', error);
    return { adData: [], currency: 'USD' };
  }
};

// New API functions to centralize the API calls

const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const assistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID;

if (!openaiApiKey || !assistantId) {
  throw new Error('OpenAI API Key or Assistant ID is not defined.');
}

export const createThread = async (): Promise<string> => {
  if (cachedThreadId) return cachedThreadId!; // Non-null assertion

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/threads',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );
    cachedThreadId = response.data.id;
    return cachedThreadId!;
  } catch (error: any) {
    throw new Error('Failed to create thread');
  }
};

export const addMessageToThread = async (threadId: string, adSetDetail: any): Promise<void> => {
  const prompt = `
  Analyze the following ad set metrics:
  1. **CPC**: ${adSetDetail?.cpc || 'N/A'}
  2. **CPM**: ${adSetDetail?.cpm || 'N/A'}
  3. **Impressions**: ${adSetDetail?.impressions || 'N/A'}
  4. **Spent**: ${adSetDetail?.spend || 'N/A'}

  Provide detailed insights into the performance of the ad set. For each ad set metric, format the response with numbers and bullet points for each recommendation or insight. Do not include any citations or references in the response.
  `;

  try {
    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        role: 'user',
        content: prompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );
  } catch (error: any) {
    throw new Error('Failed to add message to thread');
  }
};

export const createRun = async (threadId: string): Promise<string> => {
  if (cachedRunId) return cachedRunId!; // Non-null assertion

  try {
    const response = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        assistant_id: assistantId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );
    cachedRunId = response.data.id;
    return cachedRunId!;
  } catch (error: any) {
    throw new Error('Failed to create run');
  }
};

export const waitForRunCompletion = async (threadId: string, runId: string): Promise<void> => {
  const checkInterval = 5000; // Check every 5 seconds
  const maxAttempts = 12; // Maximum attempts (1 minute total)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      });

      const status = response.data?.status;

      if (status === 'completed') {
        return;
      } else if (status === 'failed') {
        throw new Error('Run failed');
      }

      // Wait for the next check
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    } catch (error: any) {
      throw new Error('Failed to check run status');
    }
  }

  throw new Error('Run did not complete within the expected time');
};

export const getAIResponse = async (threadId: string): Promise<string | null> => {
  if (cachedAIResponse) return cachedAIResponse!; // Non-null assertion

  try {
    const response = await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    });

    const messages = response.data?.data;

    // Iterate through the messages to find the first response from the assistant
    for (const message of messages) {
      if (message.role === 'assistant') {
        if (message.content && message.content[0].text && message.content[0].text.value) {
          cachedAIResponse = message.content[0].text.value;
          return cachedAIResponse!;
        }
      }
    }

    return null;
  } catch (error: any) {
    throw new Error('Failed to retrieve AI response');
  }
};
