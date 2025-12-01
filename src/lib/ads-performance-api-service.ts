// Centralized Ads Performance API Service
// This service batches all Facebook API calls for ads performance data

import axios from 'axios';
import { createClient } from '../../utils/supabase/client';

// Types for ads performance data
export interface AdData {
  id: string;
  name: string;
  status: string;
  impressions: number;
  spend: number;
  clicks: number;
  ctr: number;
  cpc: number;
  reach: number;
  frequency: number;
  actions: Array<{ action_type: string; value: string }>;
  creative: any;
  imageUrl?: string;
}

export interface AdsPerformanceData {
  ads: AdData[];
  currency: string;
  activeAds: number;
  averageCtr: number;
}

export interface AdsPerformanceApiParams {
  startDate: string;
  endDate: string;
  timeRange: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';
}

// Supabase client
const supabase = createClient();

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in-memory cache
const SUPABASE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes Supabase cache
const RATE_LIMIT_COOLDOWN = 15 * 60 * 1000; // 15 minutes

// In-memory cache (keyed by date range)
let cachedAdsPerformanceData: Map<string, { data: AdsPerformanceData; timestamp: number }> = new Map();
let rateLimitCooldown: number = 0;
let isFetching: boolean = false;
let fetchPromise: Promise<AdsPerformanceData> | null = null;

// API call counter for debugging
let apiCallCount = 0;

/**
 * Make a Facebook API call with retry logic
 */
async function makeFacebookApiCall(url: string, params: any, maxRetries: number = 3, method: 'GET' | 'POST' = 'GET'): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔄 Facebook API call attempt ${attempt + 1}/${maxRetries}:`, url, method);
      
      let response;
      if (method === 'POST') {
        response = await axios.post(url, params);
      } else {
        response = await axios.get(url, { params });
      }
      
      return response.data;
    } catch (error: any) {
      console.warn(`⚠️ Facebook API call attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Get authenticated user from Supabase
 */
async function getAuthenticatedUser() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }
  return user;
}

/**
 * Get cached data from Supabase
 */
async function getCachedAdsPerformanceData(
  userId: string,
  adAccountId: string,
  startDate: string,
  endDate: string,
  timeRange: string
): Promise<{ data: AdsPerformanceData | null; isFresh: boolean }> {
  try {
    console.log('🔍 Checking Supabase ads performance cache with key:', {
      userId,
      adAccountId,
      startDate,
      endDate,
      timeRange
    });
    
    const { data, error } = await supabase.rpc('get_valid_ads_performance_cache', {
      p_user_id: userId,
      p_ad_account_id: adAccountId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_time_range: timeRange
    });

    if (error) {
      console.warn('⚠️ Error checking ads performance cache:', error.message);
      return { data: null, isFresh: false };
    }

    if (data && data.length > 0) {
      const cacheEntry = data[0];
      console.log('✅ Found cached ads performance data in Supabase');
      console.log('📅 Cache is fresh:', cacheEntry.is_fresh);
      return {
        data: cacheEntry.cached_data as AdsPerformanceData,
        isFresh: cacheEntry.is_fresh
      };
    }

    console.log('❌ No cached ads performance data found in Supabase');
    return { data: null, isFresh: false };
  } catch (error) {
    console.warn('⚠️ Error accessing Supabase ads performance cache:', error);
    return { data: null, isFresh: false };
  }
}

/**
 * Store data in Supabase cache
 */
async function storeCachedAdsPerformanceData(
  userId: string,
  adAccountId: string,
  startDate: string,
  endDate: string,
  timeRange: string,
  adsPerformanceData: AdsPerformanceData
): Promise<void> {
  try {
    console.log('💾 Storing ads performance data in Supabase cache with key:', {
      userId,
      adAccountId,
      startDate,
      endDate,
      timeRange
    });
    
    const { error } = await supabase.rpc('store_ads_performance_cache', {
      p_user_id: userId,
      p_ad_account_id: adAccountId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_time_range: timeRange,
      p_cached_data: adsPerformanceData
    });

    if (error) {
      console.warn('⚠️ Error storing ads performance cache:', error.message);
    } else {
      console.log('✅ Ads performance data stored in Supabase cache successfully');
    }
  } catch (error) {
    console.warn('⚠️ Error storing in Supabase ads performance cache:', error);
  }
}

/**
 * Check if cache is valid (in-memory) for a specific date range
 */
function isAdsPerformanceCacheValid(startDate: string, endDate: string, timeRange: string): boolean {
  const cacheKey = `${startDate}-${endDate}-${timeRange}`;
  const cachedEntry = cachedAdsPerformanceData.get(cacheKey);
  
  if (!cachedEntry) {
    return false;
  }
  
  const isExpired = (Date.now() - cachedEntry.timestamp) > CACHE_DURATION;
  console.log('🔍 In-memory ads performance cache check:', {
    cacheKey,
    hasEntry: !!cachedEntry,
    isExpired,
    ageMinutes: Math.round((Date.now() - cachedEntry.timestamp) / 1000 / 60)
  });
  
  return !isExpired;
}

/**
 * Check if we're in rate limit cooldown
 */
function isInRateLimitCooldown(): boolean {
  return Date.now() < rateLimitCooldown;
}

/**
 * Set rate limit cooldown
 */
function setRateLimitCooldown(): void {
  rateLimitCooldown = Date.now() + RATE_LIMIT_COOLDOWN;
  console.log(`⏰ Rate limit cooldown set until: ${new Date(rateLimitCooldown).toLocaleTimeString()}`);
}

/**
 * Fetch ads performance data from Facebook API with intelligent caching
 */
export async function fetchAdsPerformanceData(params: AdsPerformanceApiParams): Promise<AdsPerformanceData> {
  // Check if we're in rate limit cooldown
  if (isInRateLimitCooldown()) {
    const remainingTime = Math.ceil((rateLimitCooldown - Date.now()) / 1000 / 60);
    throw new Error(`Rate limit cooldown active. Please wait ${remainingTime} more minutes.`);
  }

  // Skip cache - always fetch fresh data to ensure we get high-quality images
  // (Cache might contain old data with thumbnail URLs)
  console.log('🔄 Skipping cache - fetching fresh data for high-quality images');

  // Singleton pattern to prevent multiple simultaneous fetches
  if (isFetching && fetchPromise) {
    console.log('⏳ Ads performance fetch already in progress, waiting...');
    return await fetchPromise;
  }

  isFetching = true;
  fetchPromise = performAdsPerformanceFetch(params);

  try {
    const result = await fetchPromise;
    return result;
  } finally {
    isFetching = false;
    fetchPromise = null;
  }
}

/**
 * Perform the actual fetch operation
 */
async function performAdsPerformanceFetch(params: AdsPerformanceApiParams): Promise<AdsPerformanceData> {
  apiCallCount++;
  console.log(`🚀 Starting ads performance data fetch #${apiCallCount} with params:`, params);
  
  // Get authenticated user
  const user = await getAuthenticatedUser();
  console.log('👤 Fetching ads performance data for user ID:', user.id);

  // Get Facebook credentials from Supabase
  const { data: facebookData, error: facebookError } = await supabase
    .from('facebookData')
    .select('access_token, account_id, currency')
    .eq('user_id', user.id)
    .single();

  if (facebookError || !facebookData) {
    throw new Error('Facebook credentials not found. Please connect your Facebook account.');
  }

  const { access_token, account_id: adAccountId, currency } = facebookData;

  if (!access_token || !adAccountId) {
    throw new Error('Access token or ad account ID not found');
  }

  console.log('🔑 Using ad account:', adAccountId);

  // Skip Supabase cache - always fetch fresh data to ensure high-quality images
  // (Cache might contain old data with thumbnail URLs or missing image URLs)
  console.log('🔄 Skipping Supabase cache - fetching fresh data for high-quality images');

  // Create batch requests for Facebook API
  const batchRequests = [
    // Account currency
    {
      method: 'GET',
      relative_url: `${adAccountId}?fields=currency`
    },
    // Ads list with basic info - request creative with all image fields
    {
      method: 'GET', 
      relative_url: `${adAccountId}/ads?fields=id,name,status,creative{id,name,image_url,thumbnail_url,object_story_spec{link_data{image_hash,picture},photo_data{image_hash,url},video_data{video_id}},asset_feed_spec{images{url},videos{thumbnail_url}},effective_object_story_id}&limit=1000`
    },
    // Insights data for the date range
    {
      method: 'GET',
      relative_url: `${adAccountId}/insights?fields=ad_id,impressions,spend,actions,cpc,ctr,reach,frequency&time_range=${encodeURIComponent(JSON.stringify({ since: params.startDate, until: params.endDate }))}&level=ad&limit=1000`
    }
  ];

  console.log('📦 Making batch request to Facebook API...');
  
  // Make batch request to Facebook API (must use POST for batch requests)
  const batchResponse = await axios.post(
    `https://graph.facebook.com/v21.0/`,
    {
      batch: JSON.stringify(batchRequests),
      access_token,
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  console.log('📊 Facebook batch response received:', batchResponse);

  // Process batch response
  const responses = batchResponse.data;
  
  if (!responses || !Array.isArray(responses) || responses.length < 3) {
    console.error('❌ Invalid batch response structure:', batchResponse);
    throw new Error('Invalid Facebook API batch response');
  }

  console.log('📋 Processing batch responses:', responses.length, 'items');

  // Parse response bodies with error handling
  let accountData, adsData, insightsData;
  
  try {
    accountData = JSON.parse(responses[0].body);
    console.log('✅ Account data parsed:', accountData);
  } catch (error) {
    console.error('❌ Error parsing account data:', responses[0].body);
    throw new Error('Failed to parse account data from Facebook API');
  }

  try {
    adsData = JSON.parse(responses[1].body);
    console.log('✅ Ads data parsed:', adsData);
  } catch (error) {
    console.error('❌ Error parsing ads data:', responses[1].body);
    throw new Error('Failed to parse ads data from Facebook API');
  }

  try {
    insightsData = JSON.parse(responses[2].body);
    console.log('✅ Insights data parsed:', insightsData);
  } catch (error) {
    console.error('❌ Error parsing insights data:', responses[2].body);
    throw new Error('Failed to parse insights data from Facebook API');
  }

  console.log('📈 Processing ads data:', {
    accountCurrency: accountData.currency,
    adsCount: adsData.data?.length || 0,
    insightsCount: insightsData.data?.length || 0
  });

  // Create ad names lookup
  const adNames: Record<string, string> = {};
  adsData.data?.forEach((ad: any) => {
    adNames[ad.id] = ad.name;
  });

  // Create creative lookup - store full creative objects, not just IDs
  const creatives: Record<string, any> = {};
  adsData.data?.forEach((ad: any) => {
    // Handle both creative object and creative.data[0] (if creative is paginated)
    let creative = ad?.creative;
    if (!creative && ad?.creative?.data && Array.isArray(ad.creative.data) && ad.creative.data.length > 0) {
      creative = ad.creative.data[0];
    }
    if (creative?.id) {
      // Store the full creative object with all fields
      creatives[ad.id] = creative;
    }
  });

  // Don't fetch missing creatives or images here - only fetch when ad is clicked

  // Process insights data
  const processedAds = insightsData.data?.map((insight: any) => {
    const adId = insight.ad_id;
    const clicks = insight.actions?.find((act: any) => act.action_type === 'link_click')?.value || 0;
    const impressions = insight.impressions || 0;
    const reach = insight.reach || 0;
    const frequency = insight.frequency || 0;
    
    // Calculate CTR
    const facebookCtr = insight.ctr || 0;
    const ctr = facebookCtr !== undefined ? facebookCtr : (impressions > 0 ? (clicks / impressions) * 100 : 0);
    
    const cpc = insight.cpc || 0;
    // Store the full creative object (not just ID) so we can use it later
    const creative = creatives[adId] || null;
    // Don't set imageUrl here - will be fetched on-demand when ad is clicked
    const imageUrl = undefined;
    
    // Use insight.name if present, then adNames, then fallback
    let adName = insight.name || adNames[adId] || 'Unnamed Ad';

    return {
      id: adId,
      ad_id: adId, // Add ad_id for compatibility with AdTable component
      name: adName,
      status: 'ACTIVE', // Default status
      impressions: parseFloat(impressions) || 0,
      spend: parseFloat(insight.spend) || 0,
      clicks: parseFloat(clicks) || 0,
      ctr: parseFloat(ctr) || 0,
      cpc: parseFloat(cpc) || 0,
      reach: parseFloat(reach) || 0,
      frequency: parseFloat(frequency) || 0,
      actions: insight.actions || [],
      creative: creative || null, // Store full creative object with all fields
      imageUrl
    };
  }) || [];

  // Calculate summary statistics
  const activeAdsCount = processedAds.filter(ad => ad.impressions > 0).length;
  const totalCtr = processedAds.reduce((sum, ad) => sum + ad.ctr, 0);
  const averageCtr = processedAds.length > 0 ? totalCtr / processedAds.length : 0;

  const adsPerformanceData: AdsPerformanceData = {
    ads: processedAds,
    currency: accountData.currency || currency,
    activeAds: activeAdsCount,
    averageCtr: averageCtr
  };

  console.log('✅ Ads performance data processed successfully:', {
    totalAds: processedAds.length,
    activeAds: activeAdsCount,
    averageCtr: averageCtr.toFixed(2),
    currency: adsPerformanceData.currency
  });

  // Store in Supabase cache
  await storeCachedAdsPerformanceData(
    user.id,
    adAccountId,
    params.startDate,
    params.endDate,
    params.timeRange,
    adsPerformanceData
  );

  // Update in-memory cache
  const cacheKey = `${params.startDate}-${params.endDate}-${params.timeRange}`;
  cachedAdsPerformanceData.set(cacheKey, {
    data: adsPerformanceData,
    timestamp: Date.now()
  });

  return adsPerformanceData;
}

/**
 * Clear Supabase ads performance cache for specific parameters
 */
async function clearSupabaseAdsPerformanceCache(
  userId: string,
  adAccountId: string,
  startDate: string,
  endDate: string,
  timeRange: string
): Promise<void> {
  try {
    console.log('🧹 Clearing Supabase ads performance cache for:', { userId, adAccountId, startDate, endDate, timeRange });
    
    // Delete the specific cache entry
    const { error } = await supabase
      .from('ads_performance_cache')
      .delete()
      .eq('user_id', userId)
      .eq('ad_account_id', adAccountId)
      .eq('start_date', startDate)
      .eq('end_date', endDate)
      .eq('time_range', timeRange);
    
    if (error) {
      console.warn('⚠️ Error clearing Supabase ads performance cache:', error.message);
    } else {
      console.log('✅ Supabase ads performance cache cleared');
    }
  } catch (error) {
    console.warn('⚠️ Error clearing Supabase ads performance cache:', error);
  }
}

/**
 * Clear ads performance cache
 */
export function clearAdsPerformanceCache(): void {
  console.log('🧹 Clearing ads performance cache...');
  cachedAdsPerformanceData.clear();
  console.log('✅ Ads performance cache cleared');
}

/**
 * Get last fetch time for debugging
 */
export function getLastAdsPerformanceFetchTime(): number {
  if (cachedAdsPerformanceData.size === 0) {
    return 0;
  }
  
  let latestTime = 0;
  cachedAdsPerformanceData.forEach(entry => {
    if (entry.timestamp > latestTime) {
      latestTime = entry.timestamp;
    }
  });
  
  return latestTime;
}

/**
 * Fetch image URL from a creative object (on-demand, when ad is clicked)
 * Uses the creative object that was already fetched with all fields
 */
export async function fetchAdImage(creative: any): Promise<string | null> {
  if (!creative || !creative.id) {
    return null;
  }

  try {
    // Get authenticated user and access token for image_hash resolution
    const user = await getAuthenticatedUser();
    const { data: facebookData, error: facebookError } = await supabase
      .from('facebookData')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (facebookError || !facebookData?.access_token) {
      return null;
    }

    const { access_token } = facebookData;

    // Priority 1: Direct HD image_url if present
    if (creative.image_url) {
      return creative.image_url;
    }

    // Priority 2: Dynamic/catalog assets
    const assetImg = creative.asset_feed_spec?.images?.[0]?.url;
    if (assetImg) {
      return assetImg;
    }

    // Priority 3: Link ads - try image_hash first (highest quality)
    const linkData = creative.object_story_spec?.link_data;
    if (linkData?.image_hash) {
      try {
        const imageResponse = await makeFacebookApiCall(
          `https://graph.facebook.com/v21.0/${linkData.image_hash}`,
          { 
            access_token, 
            fields: 'url' 
          }
        );
        if (imageResponse?.url) {
          return imageResponse.url;
        }
      } catch (err) {
        // Continue to next option
      }
    }
    
    // Priority 4: Link ads - picture field
    if (linkData?.picture) {
      return linkData.picture;
    }

    // Priority 5: Photo ads - try image_hash first
    const photoData = creative.object_story_spec?.photo_data;
    if (photoData?.image_hash) {
      try {
        const imageResponse = await makeFacebookApiCall(
          `https://graph.facebook.com/v21.0/${photoData.image_hash}`,
          { 
            access_token, 
            fields: 'url' 
          }
        );
        if (imageResponse?.url) {
          return imageResponse.url;
        }
      } catch (err) {
        // Continue to next option
      }
    }
    
    // Priority 6: Photo ads - url field
    if (photoData?.url) {
      return photoData.url;
    }

    // Priority 7: Page post ads – image is on the post, not the creative
    // This is critical - many ads store HD images on the post, not the creative
    if (creative.effective_object_story_id) {
      try {
        const postResponse = await makeFacebookApiCall(
          `https://graph.facebook.com/v21.0/${creative.effective_object_story_id}`,
          { 
            access_token, 
            fields: 'full_picture,attachments{media{image{src}}}' 
          }
        );
        
        const postImg = postResponse?.full_picture || postResponse?.attachments?.data?.[0]?.media?.image?.src;
        if (postImg) {
          return postImg;
        }
      } catch (err: any) {
        // Check if it's a permission error
        if (err?.response?.data?.error?.code === 10 || 
            err?.response?.data?.error?.message?.includes('pages_read_engagement')) {
          // Permission missing - user needs to reconnect with pages_read_engagement
          // For now, continue to fallback (thumbnail_url)
        }
        // Continue to fallback for other errors too
      }
    }

    // Priority 8: Fallback to thumbnail_url only if nothing else available (blurred, low quality)
    if (creative.thumbnail_url) {
      return creative.thumbnail_url;
    }

    return null;
  } catch (err) {
    return null;
  }
}
