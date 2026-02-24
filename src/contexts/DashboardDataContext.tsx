// Dashboard Data Context
// This context provides centralized dashboard data to all components

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchDashboardData, clearDashboardCache, DashboardData, DashboardApiParams } from '@/lib/dashboard-api-service';
import { fetchAdsPerformanceData, clearAdsPerformanceCache, AdsPerformanceData, AdsPerformanceApiParams } from '@/lib/ads-performance-api-service';
import { getFallbackDashboardData, getRateLimitMessage } from '@/lib/fallback-data-service';

interface DashboardDataContextType {
  data: DashboardData | null;
  adsPerformanceData: AdsPerformanceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  refetchAdsPerformance: (params?: AdsPerformanceApiParams) => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

interface DashboardDataProviderProps {
  children: ReactNode;
  params: DashboardApiParams;
  dataSource?: 'facebook' | 'google';
}

export const DashboardDataProvider: React.FC<DashboardDataProviderProps> = ({ children, params, dataSource = 'facebook' }) => {
  console.log('📊 DashboardDataProvider initialized with source:', dataSource);
  const [data, setData] = useState<DashboardData | null>(null);
  const [adsPerformanceData, setAdsPerformanceData] = useState<AdsPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params.startDate || !params.endDate) {
      console.log('⚠️ Missing date params, skipping fetch:', params);
      setLoading(false);
      return;
    }

    setLoading(true);
    setData(null); // Clear stale data immediately to prevent confusion
    setError(null);

    // Check if Google Ads is selected
    if (dataSource === 'google') {
      console.log('📊 Google Ads data source selected');
      setLoading(true);
      setError(null);

      try {
        // Import and use Google Ads API service
        const { fetchGoogleAdsDashboardData } = await import('@/lib/google-ads-api-service');
        const googleAdsData = await fetchGoogleAdsDashboardData({
          startDate: params.startDate,
          endDate: params.endDate,
          timeRange: params.timeRange,
        });

        setData(googleAdsData as any); // Type assertion since structures are compatible
        console.log('✅ Google Ads data fetched successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Google Ads data';
        console.error('❌ Error fetching Google Ads data:', err);
        setError(errorMessage);

        // Show placeholder data on error
        setData({
          budget: { value: 'Error', diff: 0, trend: 'up' as const, currency: 'USD' },
          impressions: { value: 'N/A', diff: 0, trend: 'up' as const },
          ctr: { value: 'N/A', diff: 0, trend: 'up' as const },
          reach: { value: 'N/A', diff: 0, trend: 'up' as const },
          adSpend: { value: 'N/A', diff: 0, trend: 'up' as const, currency: 'USD' },
          adsRunning: { value: 'N/A', diff: 0, trend: 'up' as const },
        } as any);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fetch Facebook Ads data
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching Facebook Ads dashboard data via context with params:', params);
      const dashboardData = await fetchDashboardData(params);
      setData(dashboardData);
      console.log('✅ Dashboard data fetched successfully via context');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';

      // Check if it's a rate limit error
      if (errorMessage.includes('Rate limit') || errorMessage.includes('too many calls')) {
        console.log('⚠️ Rate limit detected, using fallback data');
        setData(getFallbackDashboardData());
        setError(getRateLimitMessage());
      } else {
        setError(errorMessage);
        console.error('❌ Error fetching dashboard data via context:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [params.startDate, params.endDate, params.timeRange, dataSource]);

  const clearCache = useCallback(() => {
    clearDashboardCache();
    clearAdsPerformanceCache();
    setData(null);
    setAdsPerformanceData(null);
  }, []);

  const refetchAdsPerformance = useCallback(async (adsParams?: AdsPerformanceApiParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching ads performance data via context with params:', adsParams);
      const adsData = await fetchAdsPerformanceData(adsParams || {
        startDate: params.startDate,
        endDate: params.endDate,
        timeRange: params.timeRange
      });
      setAdsPerformanceData(adsData);
      console.log('✅ Ads performance data fetched successfully via context');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ads performance data';
      console.error('❌ Error fetching ads performance data via context:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    console.log('📅 DashboardDataContext: Params changed, triggering fetch:', params);
    fetchData();
  }, [fetchData]);

  // Listen for ad account changes to trigger refetch
  useEffect(() => {
    const handleAdAccountChange = (event: CustomEvent) => {
      console.log('🔄 Ad account changed event received:', event.detail);
      console.log('🔄 Triggering dashboard data refetch due to ad account change');

      // Refetch both dashboard data and ads performance data
      fetchData();
      refetchAdsPerformance();
    };

    window.addEventListener('adAccountChanged', handleAdAccountChange as EventListener);

    return () => {
      window.removeEventListener('adAccountChanged', handleAdAccountChange as EventListener);
    };
  }, [fetchData, refetchAdsPerformance]);

  // Debug effect to track params changes
  useEffect(() => {
    console.log('📅 DashboardDataContext: Params updated:', params);
  }, [params]);

  // Auto-retry mechanism for rate limit errors
  useEffect(() => {
    if (error && error.includes('rate limit')) {
      console.log('🔄 Setting up auto-retry for rate limit error...');
      const retryTimer = setTimeout(() => {
        console.log('🔄 Auto-retrying after rate limit cooldown...');
        fetchData();
      }, 16 * 60 * 1000); // Retry after 16 minutes (1 minute after 15-minute cooldown)

      return () => clearTimeout(retryTimer);
    }
  }, [error, fetchData]);

  const value: DashboardDataContextType = {
    data,
    adsPerformanceData,
    loading,
    error,
    refetch: fetchData,
    clearCache,
    refetchAdsPerformance,
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = (): DashboardDataContextType => {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
};

export const useAdsPerformanceData = () => {
  const { adsPerformanceData, loading, error, refetchAdsPerformance } = useDashboardData();
  return {
    data: adsPerformanceData,
    loading,
    error,
    refetch: refetchAdsPerformance,
  };
};

// Individual data hooks for backward compatibility
export const useBudgetData = () => {
  const { data, loading, error, refetch } = useDashboardData();
  return {
    data: data?.budget || null,
    loading,
    error,
    refetch,
  };
};

export const useImpressionsData = () => {
  const { data, loading, error, refetch } = useDashboardData();
  return {
    data: data?.impressions || null,
    loading,
    error,
    refetch,
  };
};

export const useReachData = () => {
  const { data, loading, error, refetch } = useDashboardData();
  return {
    data: data?.reach || null,
    loading,
    error,
    refetch,
  };
};

export const useAdSpendData = () => {
  const { data, loading, error, refetch } = useDashboardData();
  return {
    data: data?.adSpend || null,
    loading,
    error,
    refetch,
  };
};

export const useAdsRunningData = () => {
  const { data, loading, error, refetch } = useDashboardData();
  return {
    data: data?.adsRunning || null,
    loading,
    error,
    refetch,
  };
};

export const useCTRData = () => {
  const { data, loading, error, refetch } = useDashboardData();
  return {
    data: data?.ctr || null,
    loading,
    error,
    refetch,
  };
};

