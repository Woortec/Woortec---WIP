// Fallback Data Service
// Provides mock data when Facebook API rate limits are hit

import { DashboardData } from './dashboard-api-service';

export const getFallbackDashboardData = (): DashboardData => {
  return {
    budget: {
      value: '€0.00',
      diff: 0,
      trend: 'up',
      currency: 'EUR',
    },
    impressions: {
      value: '0',
      diff: 0,
      trend: 'up',
    },
    reach: {
      impressions: 0,
      reach: 0,
      clicks: 0,
    },
    adSpend: {
      labels: ['No Data'],
      datasets: [{
        label: 'Ad Spend',
        data: [0],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        backgroundColor: '#486A75',
        fill: true,
        barThickness: 40,
      }],
    },
    adsRunning: {
      value: '0 Active ads',
      diff: 0,
      trend: 'up',
    },
    ctr: {
      value: '0.00%',
      diff: 0,
      trend: 'up',
    },
  };
};

export const getRateLimitMessage = (): string => {
  return 'Facebook API rate limit reached. Data will refresh automatically when the limit resets.';
};
