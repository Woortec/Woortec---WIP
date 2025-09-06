// Enhanced Dashboard API Service with Supabase Caching
// This service batches all Facebook API calls and implements intelligent caching

import axios from 'axios';
import { createClient } from '../../utils/supabase/client';
import dayjs from 'dayjs';

// Types for the dashboard data
export interface DashboardData {
  budget: {
    value: string;
    diff: number;
    trend: 'up' | 'down';
    currency: string;
  };
  impressions: {
    value: string;
    diff: number;
    trend: 'up' | 'down';
  };
  reach: {
    impressions: number;
    reach: number;
    clicks: number;
  };
  adSpend: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      barThickness: number;
      borderWidth?: number;
      borderRadius?: number;
    }[];
  };
  adsRunning: {
    value: string;
    diff: number;
    trend: 'up' | 'down';
  };
  ctr: {
    value: string;
    diff: number;
    trend: 'up' | 'down';
  };
}

export interface DashboardApiParams {
  startDate: string;
  endDate: string;
  timeRange: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';
}

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in-memory cache
const SUPABASE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour Supabase cache
const RATE_LIMIT_COOLDOWN = 15 * 60 * 1000; // 15 minutes

// In-memory cache (keyed by date range)
let cachedDashboardData: Map<string, { data: DashboardData; timestamp: number }> = new Map();
let rateLimitCooldown: number = 0;
let isFetching: boolean = false;
let fetchPromise: Promise<DashboardData> | null = null;

// API call counter for debugging
let apiCallCount = 0;

// Supabase client
const supabase = createClient();

/**
 * Get cached data from Supabase
 */
async function getCachedData(
  userId: string,
  adAccountId: string,
  startDate: string,
  endDate: string,
  timeRange: string
): Promise<{ data: DashboardData | null; isFresh: boolean }> {
  try {
    console.log('🔍 Checking Supabase cache with key:', {
      userId,
      adAccountId,
      startDate,
      endDate,
      timeRange
    });
    
    const { data, error } = await supabase.rpc('get_valid_dashboard_cache', {
      p_user_id: userId,
      p_ad_account_id: adAccountId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_time_range: timeRange
    });

    if (error) {
      console.warn('⚠️ Error checking cache:', error.message);
      return { data: null, isFresh: false };
    }

    if (data && data.length > 0) {
      const cacheEntry = data[0];
      console.log('✅ Found cached data in Supabase');
      console.log('📅 Cache is fresh:', cacheEntry.is_fresh);
      return {
        data: cacheEntry.cached_data as DashboardData,
        isFresh: cacheEntry.is_fresh
      };
    }

    console.log('❌ No cached data found in Supabase');
    return { data: null, isFresh: false };
  } catch (error) {
    console.warn('⚠️ Error accessing Supabase cache:', error);
    return { data: null, isFresh: false };
  }
}

/**
 * Store data in Supabase cache
 */
async function storeCachedData(
  userId: string,
  adAccountId: string,
  startDate: string,
  endDate: string,
  timeRange: string,
  dashboardData: DashboardData
): Promise<void> {
  try {
    console.log('💾 Storing data in Supabase cache with key:', {
      userId,
      adAccountId,
      startDate,
      endDate,
      timeRange
    });
    
    const { error } = await supabase.rpc('store_dashboard_cache', {
      p_user_id: userId,
      p_ad_account_id: adAccountId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_time_range: timeRange,
      p_cached_data: dashboardData
    });

    if (error) {
      console.warn('⚠️ Error storing cache:', error.message);
    } else {
      console.log('✅ Data stored in Supabase cache successfully');
    }
  } catch (error) {
    console.warn('⚠️ Error storing in Supabase cache:', error);
  }
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
 * Clear all caches
 */
export function clearDashboardCache(): void {
  cachedDashboardData.clear();
  apiCallCount = 0;
  console.log('🧹 Dashboard cache cleared');
}

/**
 * Get API call count for debugging
 */
export function getApiCallCount(): number {
  return apiCallCount;
}

/**
 * Get last fetch time for debugging
 */
export function getLastFetchTime(): Date | null {
  // Return the most recent timestamp from any cached entry
  let latestTime = 0;
  cachedDashboardData.forEach((entry) => {
    if (entry.timestamp > latestTime) {
      latestTime = entry.timestamp;
    }
  });
  return latestTime > 0 ? new Date(latestTime) : null;
}

/**
 * Check if cache is valid (in-memory) for a specific date range
 */
function isCacheValid(startDate: string, endDate: string, timeRange: string): boolean {
  const cacheKey = `${startDate}-${endDate}-${timeRange}`;
  const cachedEntry = cachedDashboardData.get(cacheKey);
  
  if (!cachedEntry) {
    return false;
  }
  
  const isExpired = (Date.now() - cachedEntry.timestamp) > CACHE_DURATION;
  console.log('🔍 In-memory cache check:', {
    cacheKey,
    hasEntry: !!cachedEntry,
    isExpired,
    age: Date.now() - cachedEntry.timestamp
  });
  
  return !isExpired;
}

/**
 * Fetch dashboard data from Facebook API with intelligent caching
 */
export async function fetchDashboardData(params: DashboardApiParams): Promise<DashboardData> {
  // Check if we're in rate limit cooldown
  if (isInRateLimitCooldown()) {
    const remainingTime = Math.ceil((rateLimitCooldown - Date.now()) / 1000 / 60);
    throw new Error(`Rate limit cooldown active. Please wait ${remainingTime} more minutes.`);
  }

  // Check in-memory cache first
  if (isCacheValid(params.startDate, params.endDate, params.timeRange)) {
    const cacheKey = `${params.startDate}-${params.endDate}-${params.timeRange}`;
    const cachedEntry = cachedDashboardData.get(cacheKey);
    console.log('✅ Using in-memory cached data for:', cacheKey);
    return cachedEntry!.data;
  }

  // Singleton pattern: prevent multiple simultaneous calls
  if (isFetching && fetchPromise) {
    console.log('⏳ Waiting for existing fetch to complete...');
    return fetchPromise;
  }

  // Start new fetch
  isFetching = true;
  fetchPromise = performFetch(params);
  
  try {
    const result = await fetchPromise;
    return result;
  } finally {
    isFetching = false;
    fetchPromise = null;
  }
}

/**
 * Perform the actual data fetch with caching logic
 */
async function performFetch(params: DashboardApiParams): Promise<DashboardData> {
  try {
    console.log('🔄 Fetching dashboard data...');
    apiCallCount++;
    
    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user's Facebook access token and ad account from facebookData table
    const { data: facebookData, error: facebookDataError } = await supabase
      .from('facebookData')
      .select('access_token, account_id, account_name, currency')
      .eq('user_id', user.id)
      .single();

    if (facebookDataError || !facebookData?.access_token || !facebookData?.account_id) {
      throw new Error('Facebook integration not configured');
    }

    const { access_token: facebook_access_token, account_id: adAccountId, currency: accountCurrency } = facebookData;

    // Check Supabase cache first
    const { data: cachedData, isFresh } = await getCachedData(
      user.id,
      adAccountId,
      params.startDate,
      params.endDate,
      params.timeRange
    );

    // If we have fresh cached data, use it
    if (cachedData && isFresh) {
      console.log('✅ Using fresh Supabase cached data');
      
      // Also store in in-memory cache for faster access
      const cacheKey = `${params.startDate}-${params.endDate}-${params.timeRange}`;
      cachedDashboardData.set(cacheKey, {
        data: cachedData,
        timestamp: Date.now()
      });
      console.log('💾 Stored Supabase data in in-memory cache with key:', cacheKey);
      
      return cachedData;
    }

    // If cache is stale or doesn't exist, fetch from Facebook
    console.log('🌐 Fetching fresh data from Facebook API...');
    
    const startDate = params.startDate;
    const endDate = params.endDate;
    
    console.log('📅 Facebook API will fetch data for date range:', {
      startDate,
      endDate,
      timeRange: params.timeRange
    });

    // Create batch request for all dashboard metrics
    const batchRequests = [
      // Budget data (current period)
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=spend&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          })
        )}&level=account`,
      },
      // Budget data (previous period for comparison)
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=spend&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).subtract(dayjs(endDate).diff(dayjs(startDate), 'day') + 1, 'day').format('YYYY-MM-DD'),
            until: dayjs(startDate).subtract(1, 'day').format('YYYY-MM-DD'),
          })
        )}&level=account`,
      },
      // Impressions data (current period)
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=impressions&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          })
        )}&level=account`,
      },
      // Impressions data (previous period)
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=impressions&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).subtract(dayjs(endDate).diff(dayjs(startDate), 'day') + 1, 'day').format('YYYY-MM-DD'),
            until: dayjs(startDate).subtract(1, 'day').format('YYYY-MM-DD'),
          })
        )}&level=account`,
      },
      // Reach data (current period)
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=reach,impressions,clicks&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          })
        )}&level=account`,
      },
      // Ad spend chart data
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=spend,date_start&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          })
        )}&time_increment=1&limit=50&level=account`,
      },
      // Ads running count
      {
        method: 'GET',
        relative_url: `${adAccountId}/ads?fields=id,status&limit=1000`,
      },
      // CTR data (current period)
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=ctr,clicks&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          })
        )}&level=account`,
      },
      // CTR data (previous period)
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=ctr,clicks&time_range=${encodeURIComponent(
          JSON.stringify({
            since: dayjs(startDate).subtract(dayjs(endDate).diff(dayjs(startDate), 'day') + 1, 'day').format('YYYY-MM-DD'),
            until: dayjs(startDate).subtract(1, 'day').format('YYYY-MM-DD'),
          })
        )}&level=account`,
      },
    ];

    // Make batch request to Facebook
    const batchResponse = await axios.post(
      `https://graph.facebook.com/v21.0/`,
      {
        batch: JSON.stringify(batchRequests),
        access_token: facebook_access_token,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('📊 Batch request completed, processing results...');

    // Process batch results
    const results = batchResponse.data;
    let currentSpend = 0;
    let previousSpend = 0;
    let currentImpressions = 0;
    let previousImpressions = 0;
    let reachData = { impressions: 0, reach: 0, clicks: 0 };
    let adSpendChartData: { labels: string[]; data: number[] } = { labels: [], data: [] };
    let adsRunningCount = 0;
    let currentCTR = 0;
    let previousCTR = 0;

    results.forEach((result: any, index: number) => {
      console.log(`📊 Batch result ${index + 1}:`, result);
      
      if (result.code === 200 && result.body) {
        const data = JSON.parse(result.body);
        
        switch (index) {
          case 0: // Current spend
            currentSpend = parseFloat(data.data?.[0]?.spend || 0);
            console.log('💰 Current spend data:', currentSpend, typeof currentSpend);
            break;
          case 1: // Previous spend
            previousSpend = parseFloat(data.data?.[0]?.spend || 0);
            console.log('💰 Previous spend data:', previousSpend, typeof previousSpend);
            break;
          case 2: // Current impressions
            currentImpressions = parseInt(data.data?.[0]?.impressions || 0);
            console.log('👁️ Current impressions data:', currentImpressions, typeof currentImpressions);
            break;
          case 3: // Previous impressions
            previousImpressions = parseInt(data.data?.[0]?.impressions || 0);
            console.log('👁️ Previous impressions data:', previousImpressions, typeof previousImpressions);
            break;
          case 4: // Reach data
            const reachItem = data.data?.[0];
            reachData = {
              impressions: parseInt(reachItem?.impressions || 0),
              reach: parseInt(reachItem?.reach || 0),
              clicks: parseInt(reachItem?.clicks || 0),
            };
            console.log('📊 Reach data:', reachData);
            break;
          case 5: // Ad spend chart
            adSpendChartData = {
              labels: data.data?.map((item: any) => dayjs(item.date_start).format('MMM DD')) || [],
              data: data.data?.map((item: any) => parseFloat(item.spend || 0)) || [],
            };
            console.log('📈 Ad spend chart data:', adSpendChartData);
            break;
          case 6: // Ads running
            adsRunningCount = data.data?.filter((ad: any) => ad.status === 'ACTIVE').length || 0;
            console.log('🎯 Ads running count:', adsRunningCount);
            break;
          case 7: // Current CTR
            currentCTR = parseFloat(data.data?.[0]?.ctr || 0);
            console.log('🎯 Current CTR data:', currentCTR, typeof currentCTR);
            break;
          case 8: // Previous CTR
            previousCTR = parseFloat(data.data?.[0]?.ctr || 0);
            console.log('🎯 Previous CTR data:', previousCTR, typeof previousCTR);
            break;
        }
      } else {
        console.warn(`⚠️ Batch result ${index + 1} failed:`, result);
      }
    });

    // Ensure all values are numbers and calculate trends and differences
    const safeCurrentSpend = Number(currentSpend) || 0;
    const safePreviousSpend = Number(previousSpend) || 0;
    const safeCurrentImpressions = Number(currentImpressions) || 0;
    const safePreviousImpressions = Number(previousImpressions) || 0;
    const safeCurrentCTR = Number(currentCTR) || 0;
    const safePreviousCTR = Number(previousCTR) || 0;

    const spendDiff = safePreviousSpend > 0 ? ((safeCurrentSpend - safePreviousSpend) / safePreviousSpend) * 100 : 0;
    const impressionsDiff = safePreviousImpressions > 0 ? ((safeCurrentImpressions - safePreviousImpressions) / safePreviousImpressions) * 100 : 0;
    const ctrDiff = safePreviousCTR > 0 ? ((safeCurrentCTR - safePreviousCTR) / safePreviousCTR) * 100 : 0;

    // Build dashboard data
    const dashboardData: DashboardData = {
      budget: {
        value: safeCurrentSpend.toFixed(2),
        diff: Math.abs(spendDiff),
        trend: spendDiff >= 0 ? 'up' : 'down',
        currency: accountCurrency || 'EUR', // Use actual currency from Facebook data
      },
      impressions: {
        value: safeCurrentImpressions.toLocaleString(),
        diff: Math.abs(impressionsDiff),
        trend: impressionsDiff >= 0 ? 'up' : 'down',
      },
      reach: reachData,
      adSpend: {
        labels: adSpendChartData.labels,
        datasets: [
          {
            label: 'Ad Spend',
            data: adSpendChartData.data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            barThickness: 20,
            borderWidth: 2,
            borderRadius: 4,
          },
        ],
      },
      adsRunning: {
        value: adsRunningCount.toString(),
        diff: 0, // No comparison data for ads running
        trend: 'up',
      },
      ctr: {
        value: (safeCurrentCTR * 100).toFixed(2),
        diff: Math.abs(ctrDiff),
        trend: ctrDiff >= 0 ? 'up' : 'down',
      },
    };

    console.log('📊 Final dashboard data:', dashboardData);

    // Store in Supabase cache
    await storeCachedData(
      user.id,
      adAccountId,
      params.startDate,
      params.endDate,
      params.timeRange,
      dashboardData
    );

    // Update in-memory cache
    const cacheKey = `${params.startDate}-${params.endDate}-${params.timeRange}`;
    cachedDashboardData.set(cacheKey, {
      data: dashboardData,
      timestamp: Date.now()
    });
    console.log('💾 Stored in in-memory cache with key:', cacheKey);

    console.log('✅ Dashboard data fetched and cached successfully');
    return dashboardData;

  } catch (error: any) {
    console.error('❌ Error fetching dashboard data:', error);
    
    // Handle rate limit errors
    if (error.response?.data?.error?.code === 17 || 
        error.message?.includes('Rate limit') || 
        error.message?.includes('too many calls')) {
      setRateLimitCooldown();
      clearDashboardCache();
      throw new Error('Facebook API rate limit reached. Please try again later.');
    }
    
    throw error;
  }
}