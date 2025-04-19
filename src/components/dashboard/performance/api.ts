import axios from 'axios';

import { createClient } from '../../../../utils/supabase/client';

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
  const supabase = createClient();

  if (dataFetched && cachedAdData.length > 0) {
    return { adData: cachedAdData, currency: cachedCurrency };
  }

  const uuid = localStorage.getItem('userid');
  const { data, error } = await supabase.from('facebookData').select('*').eq('user_id', uuid);
  const accessToken = data?.[0]?.access_token ?? '';
  const adAccountId = data?.[0]?.account_id ?? '';

  if (!accessToken || !adAccountId) {
    console.error('Access token or ad account ID not found');
    return { adData: [], currency: 'USD' };
  }

  try {
    const batchRequest = [
      { method: 'GET', relative_url: `${adAccountId}?fields=currency` },
      { method: 'GET', relative_url: `${adAccountId}/ads?fields=id,name,status,creative.limit(50)` },
      { method: 'GET', relative_url: `${adAccountId}/insights?fields=ad_id,impressions,spend,actions,cpc&date_preset=last_7d&level=ad&limit=50` },
    ];

    const batchResponse = await axios.post(
      `https://graph.facebook.com/v21.0`,
      { access_token: accessToken, batch: batchRequest }
    );

    const accountData = JSON.parse(batchResponse.data[0]?.body);
    const adData = JSON.parse(batchResponse.data[1]?.body);
    const insightsData = JSON.parse(batchResponse.data[2]?.body);

    cachedCurrency = accountData?.currency || 'USD';

    const activeAds = adData?.data?.filter((ad: any) => ad.status === 'ACTIVE') || [];

    const adNames: { [key: string]: string } = {};
    const creativeIds: { [key: string]: string } = {};
    activeAds.forEach((ad: any) => {
      adNames[ad.id] = ad.name;
      const creativeId = ad?.creative?.id;
      if (creativeId) {
        creativeIds[ad.id] = creativeId;
      }
    });

    const creativeIdValues = Object.values(creativeIds);
    const creativeImageUrls: { [key: string]: string } = {};

    // Fetch all creatives (batched in groups of 20 if necessary)
    const creativeResponses = await Promise.all(
      creativeIdValues.map(async (creativeId) => {
        try {
          const res = await axios.get(`https://graph.facebook.com/v21.0/${creativeId}?fields=image_url,thumbnail_url`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
    
          if (res.data?.id) {
            creativeImageUrls[res.data.id] = res.data.image_url || res.data.thumbnail_url || null;
          }
        } catch (err) {
          console.warn(`Failed to fetch creative for ID ${creativeId}`, err);
        }
      })
    );
    

    const insights = await Promise.all(
      insightsData?.data?.map(async (insight: any) => {
        const adId = insight.ad_id;
        const clicks = insight.actions?.find((action: any) => action.action_type === 'link_click')?.value || 0;
        const impressions = insight.impressions || 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = insight.cpc || 0;
    
        const creativeId = creativeIds[adId]; // get creativeId for this ad
        const imageUrl = creativeId ? creativeImageUrls[creativeId] : null; // get imageUrl from creative map
    
        return {
          ...insight,
          name: adNames[adId] || 'Unknown Ad',
          clicks,
          impressions,
          ctr,
          cpc,
          spend: insight.spend,
          imageUrl, // 🔥 This is the key
        };
      }) || []
    );
    

    cachedAdData = insights;
    dataFetched = true;

    return { adData: insights, currency: cachedCurrency };
  } catch (error) {
    console.error('Error fetching ad data:', error);
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
        Authorization: `Bearer ${openaiApiKey}`,
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
try {
  // Sending the data to the assistant, no need to specify the prompt as it's already set up in your OpenAI account
  await axios.post(
    `https://api.openai.com/v1/threads/${threadId}/messages`, // Make sure to use the thread ID of your assistant
    {
      role: 'user',
      content: JSON.stringify(adSetDetail), // The assistant will use the predefined prompt and format response
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
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
        Authorization: `Bearer ${openaiApiKey}`,
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
        Authorization: `Bearer ${openaiApiKey}`,
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
      Authorization: `Bearer ${openaiApiKey}`,
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