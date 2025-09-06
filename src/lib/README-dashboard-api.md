# Centralized Dashboard API Service

This service provides a centralized way to fetch all Facebook API data for the dashboard, reducing API calls and avoiding rate limits through intelligent batching.

## Features

- **Batch API Calls**: Combines multiple Facebook API requests into a single batch request
- **Intelligent Caching**: 5-minute cache to reduce redundant API calls
- **Rate Limit Management**: Built-in retry logic with exponential backoff
- **Error Handling**: Comprehensive error handling and logging
- **Type Safety**: Full TypeScript support with proper type definitions

## Usage

### Basic Usage

```typescript
import { fetchDashboardData } from '@/lib/dashboard-api-service';

const dashboardData = await fetchDashboardData({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  timeRange: 'month'
});
```

### Using Individual Data Fetchers

```typescript
import { 
  fetchBudgetData, 
  fetchImpressionsData, 
  fetchReachData,
  fetchAdSpendData,
  fetchAdsRunningData 
} from '@/lib/dashboard-api-service';

// Fetch individual data types
const budget = await fetchBudgetData(startDate, endDate);
const impressions = await fetchImpressionsData(startDate, endDate);
const reach = await fetchReachData(startDate, endDate);
const adSpend = await fetchAdSpendData(startDate, endDate, 'week');
const adsRunning = await fetchAdsRunningData(startDate, endDate);
```

### Using React Hooks

```typescript
import { useDashboardData, useBudgetData } from '@/hooks/use-dashboard-data';

// Fetch all dashboard data
const { data, loading, error, refetch } = useDashboardData({
  startDate,
  endDate,
  timeRange: 'week'
});

// Fetch individual data types
const { data: budget, loading, error } = useBudgetData(startDate, endDate);
```

### API Endpoint

```typescript
// GET /api/dashboard/data?startDate=2024-01-01&endDate=2024-01-31&timeRange=week
const response = await fetch('/api/dashboard/data?startDate=2024-01-01&endDate=2024-01-31&timeRange=week');
const { data } = await response.json();

// Clear cache
await fetch('/api/dashboard/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'clear-cache' })
});
```

## Data Structure

The service returns a `DashboardData` object with the following structure:

```typescript
interface DashboardData {
  budget: {
    value: string;        // Formatted currency string
    diff: number;         // Percentage change
    trend: 'up' | 'down'; // Trend direction
    currency: string;     // Currency code
  };
  impressions: {
    value: string;        // Formatted number string
    diff: number;         // Percentage change
    trend: 'up' | 'down'; // Trend direction
  };
  reach: {
    impressions: number;  // Total impressions
    reach: number;        // Total reach
    clicks: number;       // Total clicks
  };
  adSpend: {
    labels: string[];     // Chart labels
    datasets: Array<{     // Chart.js dataset format
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      barThickness: number;
    }>;
  };
  adsRunning: {
    value: string;        // Formatted string (e.g., "28 Active ads")
    diff: number;         // Percentage change
    trend: 'up' | 'down'; // Trend direction
  };
}
```

## Caching

The service implements intelligent caching:

- **Cache Duration**: 5 minutes
- **Cache Key**: Based on user ID and date range
- **Cache Invalidation**: Automatic expiration or manual clearing
- **Cache Benefits**: Reduces API calls and improves performance

```typescript
import { clearDashboardCache } from '@/lib/dashboard-api-service';

// Clear cache manually
clearDashboardCache();
```

## Error Handling

The service includes comprehensive error handling:

- **Rate Limit Handling**: Automatic retry with exponential backoff
- **Network Errors**: Retry logic for network failures
- **API Errors**: Proper error messages and logging
- **Validation**: Input validation for required parameters

## Rate Limit Management

Built-in rate limit management:

- **Exponential Backoff**: Increasing delays between retries
- **Max Retries**: Configurable retry attempts (default: 3)
- **Error Detection**: Automatic detection of rate limit errors
- **Graceful Degradation**: Fallback behavior on persistent failures

## Migration from Individual API Calls

### Before (Individual API Calls)
```typescript
// Multiple separate API calls
const budgetResponse = await axios.get(`/insights?fields=spend&time_range=...`);
const impressionsResponse = await axios.get(`/insights?fields=impressions&time_range=...`);
const reachResponse = await axios.get(`/insights?fields=impressions,reach,clicks&time_range=...`);
// ... more individual calls
```

### After (Centralized Service)
```typescript
// Single batch request
const dashboardData = await fetchDashboardData({
  startDate,
  endDate,
  timeRange: 'week'
});
```

## Benefits

1. **Reduced API Calls**: From ~8 individual calls to 1 batch request
2. **Better Performance**: Faster loading times due to batching
3. **Rate Limit Avoidance**: Intelligent request management
4. **Consistent Data**: All data fetched at the same time
5. **Easier Maintenance**: Centralized logic for all dashboard data
6. **Better Caching**: Shared cache across all dashboard components
7. **Type Safety**: Full TypeScript support

## Configuration

The service can be configured through environment variables or direct modification:

```typescript
// Cache duration (default: 5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Max retries for rate limit handling (default: 3)
const maxRetries = 3;

// Facebook API version (default: v21.0)
const apiVersion = 'v21.0';
```

## Monitoring and Logging

The service includes comprehensive logging:

- **Request Logging**: All API requests are logged
- **Error Logging**: Detailed error information
- **Performance Logging**: Request timing and cache hits
- **Rate Limit Logging**: Rate limit detection and handling

## Future Enhancements

Planned improvements:

1. **Redis Caching**: Server-side caching for better performance
2. **Real-time Updates**: WebSocket support for live data
3. **Data Aggregation**: Pre-computed metrics for faster loading
4. **Analytics**: Usage tracking and performance metrics
5. **Background Sync**: Automatic data refresh in the background
