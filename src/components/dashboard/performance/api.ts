import axios from 'axios';
import { createClient } from '../../../../utils/supabase/client';

let cachedAdData: any[] = [];
let cachedCurrency: string = 'USD';
let dataFetched = false;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// — Removed SYSTEM_PROMPT constant so assistant config is used instead

// Format the user's ad data into a prompt
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
  lastFetchTime = 0;
  console.log('Ad data cache cleared');
};

// Helper function to get user ID from auth token
const getUserIdFromAuth = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try to get user ID from the auth token
    const tokenKey = 'sb-uvhvgcrczfdfvoujarga-auth-token';
    const storedToken = localStorage.getItem(tokenKey);
    
    if (storedToken) {
      const parsedToken = JSON.parse(storedToken);
      return parsedToken?.user?.id || null;
    }
    
    // Fallback to custom auth token
    const customToken = localStorage.getItem('custom-auth-token');
    if (customToken) {
      const parsedCustomToken = JSON.parse(customToken);
      return parsedCustomToken?.user?.id || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    return null;
  }
};

// Helper function to make Facebook API calls with retry logic
const makeFacebookApiCall = async (url: string, params: any, maxRetries = 3): Promise<any> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        params,
        timeout: 30000
        // Removed User-Agent header as browsers don't allow it
      });
      
      // Check for Facebook API errors
      if (response.data.error) {
        const error = response.data.error;
        
        // Handle rate limiting - only retry for actual rate limit errors
        if (error.code === 80004 || error.code === 4 || error.code === 17) {
          console.log(`⚠️ Rate limit hit (attempt ${attempt + 1}/${maxRetries}), waiting...`);
          const waitTime = Math.pow(2, attempt + 1) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // For other errors, throw immediately
        throw new Error(`Facebook API error: ${error.message} (code: ${error.code})`);
      }
      
      return response.data;
    } catch (error: any) {
      // Check if it's a rate limit error in the response
      if (error.response?.data?.error?.code === 80004 || 
          error.response?.data?.error?.code === 4 || 
          error.response?.data?.error?.code === 17) {
        console.log(`⚠️ Rate limit hit (attempt ${attempt + 1}/${maxRetries}), waiting...`);
        const waitTime = Math.pow(2, attempt + 1) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For 400 Bad Request or other errors, don't retry
      if (error.response?.status === 400) {
        console.error('❌ Bad Request error:', error.response.data);
        throw new Error(`Bad Request: ${error.response.data?.error?.message || 'Invalid request'}`);
      }
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      console.log(`⚠️ API call failed (attempt ${attempt + 1}/${maxRetries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
};

export const fetchAdData = async () => {
  const supabase = createClient();

  // Check if cache is still valid (within 5 minutes)
  const now = Date.now();
  if (dataFetched && cachedAdData.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return { adData: cachedAdData, currency: cachedCurrency };
  }

  // Reset cache if it's stale
  if ((now - lastFetchTime) >= CACHE_DURATION) {
    clearAdDataCache();
  }

  const uuid = getUserIdFromAuth();
  
  if (!uuid) {
    console.error('User ID not found in auth tokens');
    return { adData: [], currency: 'USD' };
  }

  console.log('🔍 Fetching ad data for user ID:', uuid);

  const { data } = await supabase.from('facebookData').select('*').eq('user_id', uuid);
  
  console.log('🔍 Facebook data from Supabase:', data);
  
  const accessToken = data?.[0]?.access_token ?? '';
  const adAccountId = data?.[0]?.account_id ?? '';

  if (!accessToken || !adAccountId) {
    console.error('❌ Access token or ad account ID not found for user:', uuid);
    console.log('📊 Available data:', data);
    // Reset cache on error to prevent infinite loops
    clearAdDataCache();
    return { adData: [], currency: 'USD' };
  }

  console.log('✅ Found Facebook credentials - Access Token:', accessToken ? 'Present' : 'Missing', 'Ad Account ID:', adAccountId);

  try {
    // Make individual API calls instead of batch to reduce rate limiting
    console.log('🔄 Fetching account data...');
    const accountData = await makeFacebookApiCall(
      `https://graph.facebook.com/v21.0/${adAccountId}`,
      { access_token: accessToken, fields: 'currency' }
    );

    console.log('🔄 Fetching ad data...');
    const adData = await makeFacebookApiCall(
      `https://graph.facebook.com/v21.0/${adAccountId}/ads`,
      { 
        access_token: accessToken, 
        fields: 'id,name,status,creative.limit(50)',
        limit: 50
      }
    );

    console.log('🔄 Fetching insights data...');
    const insightsData = await makeFacebookApiCall(
      `https://graph.facebook.com/v21.0/${adAccountId}/insights`,
      { 
        access_token: accessToken, 
        fields: 'ad_id,impressions,spend,actions,cpc,ctr',
        date_preset: 'last_7d',
        level: 'ad',
        limit: 50
      }
    );

    console.log('📊 Facebook API responses:');
    console.log('  - Account data:', accountData);
    console.log('  - Ad data count:', adData?.data?.length || 0);
    console.log('  - Insights data count:', insightsData?.data?.length || 0);

    cachedCurrency = accountData?.currency || 'USD';

    const activeAds = adData?.data?.filter((ad: any) => ad.status === 'ACTIVE') || [];
    console.log('🎯 Active ads found:', activeAds.length);
    
    if (activeAds.length === 0) {
      console.log('⚠️ No active ads found. This could mean:');
      console.log('  1. No ads are currently running');
      console.log('  2. Ads are paused or inactive');
      console.log('  3. The ad account has no ads');
      console.log('  4. Date range has no data');
    }

    const adNames: Record<string, string> = {};
    activeAds.forEach((ad: any) => {
      adNames[ad.id] = ad.name;
    });

    const creativeIds: Record<string, string> = {};
    activeAds.forEach((ad: any) => {
      const creativeId = ad?.creative?.id;
      if (creativeId) creativeIds[ad.id] = creativeId;
    });

    const creativeImageUrls: Record<string, string | null> = {};
    await Promise.all(
      Object.values(creativeIds).map(async (cid) => {
        try {
          const res = await makeFacebookApiCall(
            `https://graph.facebook.com/v21.0/${cid}`,
            { 
              access_token: accessToken, 
              fields: 'image_url,thumbnail_url' 
            }
          );
          if (res?.id) {
            creativeImageUrls[res.id] = res.image_url || res.thumbnail_url || null;
          }
        } catch (err) {
          console.warn(`Failed to fetch creative ${cid}`, err);
        }
      })
    );

    const insights = await Promise.all(
      insightsData?.data?.map(async (insight: any) => {
        const adId = insight.ad_id;
        const clicks = insight.actions?.find((act: any) => act.action_type === 'link_click')?.value || 0;
        const impressions = insight.impressions || 0;
        // Use Facebook's provided CTR if available, otherwise calculate it
        const facebookCtr = insight.ctr;
        const ctr = facebookCtr !== undefined ? facebookCtr * 100 : (impressions > 0 ? (clicks / impressions) * 100 : 0);
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

        return processedInsight;
      }) || []
    );

    cachedAdData = insights;
    dataFetched = true;
    lastFetchTime = now;
    console.log('✅ Successfully fetched ad data:', insights.length, 'ads');
    return { adData: insights, currency: cachedCurrency };
  } catch (error: any) {
    console.error('Error fetching ad data:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    // Reset cache on error to prevent infinite loops
    clearAdDataCache();
    return { adData: [], currency: 'USD' };
  }
};

const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
const assistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID!;

export const createThread = async (): Promise<string> => {
  // Always create a new thread, do not use cache
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
  return response.data.id;
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
  // Always create a new run, do not use cache
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
  return response.data.id;
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
  // Always fetch fresh response, do not use cache
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
        return textBlock.value;
      }
    }
  }
  return null;
};
