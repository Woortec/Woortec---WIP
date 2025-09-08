// Custom hook for using the centralized dashboard API service
// This provides a clean interface for components to fetch dashboard data

import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardData, DashboardData, DashboardApiParams } from '@/lib/dashboard-api-service';

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboardData = (params: DashboardApiParams): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params.startDate || !params.endDate) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await fetchDashboardData(params);
      setData(dashboardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [params.startDate, params.endDate, params.timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Individual data hooks for backward compatibility
export const useBudgetData = (startDate: Date | null, endDate: Date | null) => {
  const { data, loading, error, refetch } = useDashboardData({
    startDate: startDate?.toISOString() || '',
    endDate: endDate?.toISOString() || '',
    timeRange: 'thisWeek',
  });

  return {
    data: data?.budget || null,
    loading,
    error,
    refetch,
  };
};

export const useImpressionsData = (startDate: Date | null, endDate: Date | null) => {
  const { data, loading, error, refetch } = useDashboardData({
    startDate: startDate?.toISOString() || '',
    endDate: endDate?.toISOString() || '',
    timeRange: 'thisWeek',
  });

  return {
    data: data?.impressions || null,
    loading,
    error,
    refetch,
  };
};

export const useReachData = (startDate: Date | null, endDate: Date | null) => {
  const { data, loading, error, refetch } = useDashboardData({
    startDate: startDate?.toISOString() || '',
    endDate: endDate?.toISOString() || '',
    timeRange: 'thisWeek',
  });

  return {
    data: data?.reach || null,
    loading,
    error,
    refetch,
  };
};

export const useAdSpendData = (startDate: Date | null, endDate: Date | null, timeRange: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom') => {
  const { data, loading, error, refetch } = useDashboardData({
    startDate: startDate?.toISOString() || '',
    endDate: endDate?.toISOString() || '',
    timeRange,
  });

  return {
    data: data?.adSpend || null,
    loading,
    error,
    refetch,
  };
};

export const useAdsRunningData = (startDate: Date | null, endDate: Date | null) => {
  const { data, loading, error, refetch } = useDashboardData({
    startDate: startDate?.toISOString() || '',
    endDate: endDate?.toISOString() || '',
    timeRange: 'thisWeek',
  });

  return {
    data: data?.adsRunning || null,
    loading,
    error,
    refetch,
  };
};
