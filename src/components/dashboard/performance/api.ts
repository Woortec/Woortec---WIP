// Legacy API functions for AdSetDetail component
// This file provides the AI/OpenAI functions that AdSetDetail.tsx needs
// The main fetchAdData function has been moved to the centralized service

import axios from 'axios';
import { fetchAdsPerformanceData } from '@/lib/ads-performance-api-service';

const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
const assistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID!;

// Helper function to format ad data for the AI prompt
const formatAdForPrompt = (adSetDetail: any): string => {
  return `Ad Performance Data:
- Ad Name: ${adSetDetail.name || 'N/A'}
- Impressions: ${adSetDetail.impressions || 0}
- Spend: ${adSetDetail.spend || 0}
- Clicks: ${adSetDetail.clicks || 0}
- CTR: ${adSetDetail.ctr || 0}%
- CPC: ${adSetDetail.cpc || 0}
- Reach: ${adSetDetail.reach || 0}
- Frequency: ${adSetDetail.frequency || 0}
- Actions: ${JSON.stringify(adSetDetail.actions || [])}

Please provide strategic advice for improving this ad's performance.`;
};

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
    // Send only the user's actual ad metrics; assistant's system settings supply the rest
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

// Legacy fetchAdData function - now uses centralized service
export const fetchAdData = async () => {
  console.log('🔄 Legacy fetchAdData called - using centralized service');
  
  // Use the centralized service with default params
  const defaultParams = {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    timeRange: 'thisWeek' as const
  };
  
  const adsPerformanceData = await fetchAdsPerformanceData(defaultParams);
  
  // Transform to legacy format for AdSetDetail compatibility
  const adData = adsPerformanceData.ads.map(ad => ({
    ad_id: ad.id,
    name: ad.name,
    impressions: ad.impressions,
    spend: ad.spend,
    clicks: ad.clicks,
    ctr: ad.ctr,
    cpc: ad.cpc,
    reach: ad.reach,
    frequency: ad.frequency,
    actions: ad.actions,
    creative: ad.creative,
    imageUrl: ad.imageUrl
  }));
  
  return {
    adData,
    currency: adsPerformanceData.currency
  };
};
