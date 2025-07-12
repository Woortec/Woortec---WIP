import axios from 'axios';
import { createClient } from '../../../../utils/supabase/client';

let cachedAdData: any[] = [];
let cachedCurrency: string = 'USD';
let dataFetched = false;
let cachedThreadId: string | null = null;
let cachedRunId: string | null = null;
let cachedAIResponse: string | null = null;

// — Removed SYSTEM_PROMPT constant so assistant config is used instead

// Format the user’s ad data into a prompt
function formatAdForPrompt(ad: any): string {
  const header =
    `This ad set received ${ad.impressions} impressions, ` +
    `a ${(ad.ctr * 100).toFixed(2)}% CTR, ` +
    `$${parseFloat(ad.cpc).toFixed(2)} Budget, and ` +
    `$${parseFloat(ad.spend).toFixed(2)} spend.`;

  const extras: string[] = [];
  const postEng = ad.actions?.find((a: any) => a.action_type === 'post_engagement')?.value;
  if (postEng) extras.push(`Post engagement: ${postEng}`);
  const linkClicks = ad.actions?.find((a: any) => a.action_type === 'link_click')?.value;
  if (linkClicks) extras.push(`Link clicks: ${linkClicks}`);

  const convs = ad.actions
    ? ad.actions
        .map((a: any) => {
          const label = a.action_type
            .replace(/^onsite_conversion\./, '')
            .replace(/_/g, ' ');
          return `• ${label}: ${a.value}`;
        })
        .join('\n')
    : '';

  const parts = [header];
  if (extras.length) parts.push(extras.join('\n'));
  if (convs) parts.push('Conversions & Engagements:', convs);
  return parts.join('\n\n');
}

export const getItemWithExpiry = (key: string) => {
  if (typeof window !== 'undefined') {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
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
    const item = { value, expiry: now.getTime() + expiry };
    localStorage.setItem(key, JSON.stringify(item));
  }
};

export const clearAdDataCache = () => {
  cachedAdData = [];
  cachedCurrency = 'USD';
  dataFetched = false;
  cachedThreadId = null;
  cachedRunId = null;
  cachedAIResponse = null;
  console.log('Ad data cache cleared');
};

export const fetchAdData = async () => {
  const supabase = createClient();

  if (dataFetched && cachedAdData.length > 0) {
    console.log('Returning cached ad data:', cachedAdData.length, 'items');
    return { adData: cachedAdData, currency: cachedCurrency };
  }

  const uuid = localStorage.getItem('userid');
  console.log('User ID from localStorage:', uuid);
  
  const { data } = await supabase.from('facebookData').select('*').eq('user_id', uuid);
  console.log('Facebook data from Supabase:', data);
  
  const accessToken = data?.[0]?.access_token ?? '';
  const adAccountId = data?.[0]?.account_id ?? '';

  console.log('Access token exists:', !!accessToken);
  console.log('Ad account ID:', adAccountId);

  if (!accessToken || !adAccountId) {
    console.error('Access token or ad account ID not found');
    return { adData: [], currency: 'USD' };
  }

  try {
    const batchRequest = [
      { method: 'GET', relative_url: `${adAccountId}?fields=currency` },
      { method: 'GET', relative_url: `${adAccountId}/ads?fields=id,name,status,creative.limit(50)` },
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=ad_id,impressions,spend,actions,cpc&date_preset=last_7d&level=ad&limit=50`,
      },
    ];

    console.log('Making batch request to Facebook API...');
    const batchResponse = await axios.post(
      `https://graph.facebook.com/v21.0`,
      { access_token: accessToken, batch: batchRequest }
    );

    console.log('Facebook API response received');
    console.log('Batch response data:', batchResponse.data);

    const accountData = JSON.parse(batchResponse.data[0]?.body);
    const adData = JSON.parse(batchResponse.data[1]?.body);
    const insightsData = JSON.parse(batchResponse.data[2]?.body);

    // Debug: log all ad IDs and names from adData
    const adDataIds = (adData?.data || []).map((ad: any) => ad.id);
    const adDataNames = (adData?.data || []).map((ad: any) => ({ id: ad.id, name: ad.name }));
    console.log('adData IDs:', adDataIds);
    console.log('adData Names:', adDataNames);

    // Debug: log all ad IDs from insightsData
    const insightsDataIds = (insightsData?.data || []).map((insight: any) => insight.ad_id);
    console.log('insightsData IDs:', insightsDataIds);

    cachedCurrency = accountData?.currency || 'USD';

    const activeAds = adData?.data?.filter((ad: any) => ad.status === 'ACTIVE') || [];
    console.log('Active ads found:', activeAds.length);
    
    const adNames: Record<string, string> = {};
    activeAds.forEach((ad: any) => {
      adNames[ad.id] = ad.name;
    });
    console.log('Ad names mapping:', adNames);

    const creativeIds: Record<string, string> = {};
    activeAds.forEach((ad: any) => {
      const creativeId = ad?.creative?.id;
      if (creativeId) creativeIds[ad.id] = creativeId;
    });
    console.log('Creative IDs mapping:', creativeIds);

    const creativeImageUrls: Record<string, string | null> = {};
    await Promise.all(
      Object.values(creativeIds).map(async (cid) => {
        try {
          const res = await axios.get(
            `https://graph.facebook.com/v21.0/${cid}?fields=image_url,thumbnail_url`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (res.data?.id) {
            creativeImageUrls[res.data.id] = res.data.image_url || res.data.thumbnail_url || null;
          }
        } catch (err) {
          console.warn(`Failed to fetch creative ${cid}`, err);
        }
      })
    );
    console.log('Creative image URLs:', creativeImageUrls);

    const insights = await Promise.all(
      insightsData?.data?.map(async (insight: any) => {
        const adId = insight.ad_id;
        const clicks = insight.actions?.find((act: any) => act.action_type === 'link_click')?.value || 0;
        const impressions = insight.impressions || 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = insight.cpc || 0;
        const creativeId = creativeIds[adId];
        const imageUrl = creativeId ? creativeImageUrls[creativeId] : null;

        // Always use insight.name if present, then adNames, then fallback
        let adName = insight.name || adNames[adId] || 'Unnamed Ad';

        const processedInsight = {
          ...insight,
          name: adName,
          clicks,
          impressions,
          ctr,
          cpc,
          spend: insight.spend,
          imageUrl,
          actions: insight.actions,
          date_start: insight.date_start,
          date_stop: insight.date_stop,
        };

        console.log(`Processed insight for ad ${adId}:`, processedInsight);
        return processedInsight;
      }) || []
    );

    console.log('Final processed insights:', insights);
    console.log('Total insights processed:', insights.length);

    cachedAdData = insights;
    dataFetched = true;
    return { adData: insights, currency: cachedCurrency };
  } catch (error: any) {
    console.error('Error fetching ad data:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return { adData: [], currency: 'USD' };
  }
};

const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
const assistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID!;

export const createThread = async (): Promise<string> => {
  if (cachedThreadId) return cachedThreadId!;

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
};

export const addMessageToThread = async (
  threadId: string,
  adSetDetail: any
): Promise<void> => {
  try {
    // Send only the user’s actual ad metrics; assistant’s system settings supply the rest
    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        role: 'user',
        content: formatAdForPrompt(adSetDetail),
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
    throw new Error('Failed to add message to thread: ' + error.message);
  }
};

export const createRun = async (threadId: string): Promise<string> => {
  if (cachedRunId) return cachedRunId!;

  const response = await axios.post(
    `https://api.openai.com/v1/threads/${threadId}/runs`,
    { assistant_id: assistantId },
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
};

export const waitForRunCompletion = async (
  threadId: string,
  runId: string
): Promise<void> => {
  const checkInterval = 5000;
  const maxAttempts = 12;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    const status = response.data?.status;
    if (status === 'completed') return;
    if (status === 'failed') throw new Error('Run failed');
    await new Promise((res) => setTimeout(res, checkInterval));
  }

  throw new Error('Run did not complete within the expected time');
};

export const getAIResponse = async (threadId: string): Promise<string | null> => {
  if (cachedAIResponse) return cachedAIResponse!;

  const response = await axios.get(
    `https://api.openai.com/v1/threads/${threadId}/messages`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    }
  );

  for (const message of response.data?.data || []) {
    if (message.role === 'assistant') {
      const textBlock = message.content?.[0]?.text;
      if (textBlock?.value) {
        cachedAIResponse = textBlock.value;
        return cachedAIResponse!;
      }
    }
  }
  return null;
};
