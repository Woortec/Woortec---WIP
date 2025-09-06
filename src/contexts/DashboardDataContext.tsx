// Dashboard Data Context
// This context provides centralized dashboard data to all components

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchDashboardData, clearDashboardCache, DashboardData, DashboardApiParams } from '@/lib/dashboard-api-service';
import { getFallbackDashboardData, getRateLimitMessage } from '@/lib/fallback-data-service';

interface DashboardDataContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

interface DashboardDataProviderProps {
  children: ReactNode;
  params: DashboardApiParams;
}

export const DashboardDataProvider: React.FC<DashboardDataProviderProps> = ({ children, params }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params.startDate || !params.endDate) {
      console.log('⚠️ Missing date params, skipping fetch:', params);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data via context with params:', params);
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
  }, [params.startDate, params.endDate, params.timeRange]);

  const clearCache = useCallback(() => {
    clearDashboardCache();
    setData(null);
  }, []);

  useEffect(() => {
    console.log('📅 DashboardDataContext: Params changed, triggering fetch:', params);
    fetchData();
  }, [fetchData]);

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
    loading,
    error,
    refetch: fetchData,
    clearCache,
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

