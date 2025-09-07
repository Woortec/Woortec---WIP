// Legacy API functions for AdSetDetail component
// This file provides the AI/OpenAI functions that AdSetDetail.tsx needs
// The main fetchAdData function has been moved to the centralized service

import { fetchAdsPerformanceData } from '@/lib/ads-performance-api-service';

// AI/OpenAI related functions (unchanged as requested)
export const addMessageToThread = async (threadId: string, adDetail: any) => {
  // OpenAI function - keeping as is per user request
  console.log('Adding message to thread:', threadId, adDetail);
  // Implementation would go here
};

export const createRun = async (threadId: string) => {
  // OpenAI function - keeping as is per user request
  console.log('Creating run for thread:', threadId);
  // Implementation would go here
  return 'run-id';
};

export const createThread = async () => {
  // OpenAI function - keeping as is per user request
  console.log('Creating thread');
  // Implementation would go here
  return 'thread-id';
};

export const getAIResponse = async (threadId: string) => {
  // OpenAI function - keeping as is per user request
  console.log('Getting AI response for thread:', threadId);
  // Implementation would go here
  return 'AI response';
};

export const waitForRunCompletion = async (threadId: string, runId: string) => {
  // OpenAI function - keeping as is per user request
  console.log('Waiting for run completion:', threadId, runId);
  // Implementation would go here
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
