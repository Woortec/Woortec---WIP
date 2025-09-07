# Ads Performance Cache System

This document describes the caching system for ads performance data, which provides intelligent caching with automatic cleanup and 30-minute cache duration.

## Overview

The ads performance cache system implements a two-tier caching strategy:
- **In-memory cache**: 10-minute duration for fast access
- **Supabase cache**: 30-minute duration for persistence across sessions

## Features

- ✅ **30-minute cache duration** (as requested)
- ✅ **Automatic cleanup** every 15 minutes
- ✅ **Rate limit protection** with 15-minute cooldown
- ✅ **Singleton pattern** to prevent multiple simultaneous fetches
- ✅ **Two-tier caching** (in-memory + Supabase)
- ✅ **Row Level Security** for data isolation
- ✅ **Automatic expiration** handling

## Setup

### 1. Create the Cache Table and Functions

Run the setup script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of scripts/setup-ads-performance-cache.sql
```

Or use the npm script:

```bash
npm run ads-cache:setup
```

### 2. Verify Setup

Check that everything is working:

```bash
npm run ads-cache:status
```

## Usage

### API Service

The `fetchAdsPerformanceData` function automatically handles caching:

```typescript
import { fetchAdsPerformanceData } from '@/lib/ads-performance-api-service';

const data = await fetchAdsPerformanceData({
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  timeRange: 'thisWeek'
});
```

### Cache Management

```typescript
import { clearAdsPerformanceCache } from '@/lib/ads-performance-api-service';

// Clear in-memory cache
clearAdsPerformanceCache();
```

## Cache Behavior

### Cache Duration
- **In-memory cache**: 10 minutes
- **Supabase cache**: 30 minutes
- **Auto-deletion**: Every 15 minutes via cron job

### Cache Key Structure
```
${startDate}-${endDate}-${timeRange}
```

Example: `2024-01-01-2024-01-07-thisWeek`

### Cache Flow
1. **Check in-memory cache** (10 minutes)
2. **Check Supabase cache** (30 minutes)
3. **Fetch from Facebook API** if cache is stale
4. **Store in both caches** after successful fetch

## Management Commands

### Setup Cache
```bash
npm run ads-cache:setup
```

### Check Status
```bash
npm run ads-cache:status
```

### Test Functions
```bash
npm run ads-cache:test
```

### View Logs
```bash
npm run ads-cache:logs
```

### Remove Cache
```bash
npm run ads-cache:remove
```

## Database Schema

### Table: `ads_performance_cache`

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `user_id` | UUID | User identifier |
| `ad_account_id` | TEXT | Facebook ad account ID |
| `start_date` | TEXT | Cache start date |
| `end_date` | TEXT | Cache end date |
| `time_range` | TEXT | Time range (today, thisWeek, etc.) |
| `cached_data` | JSONB | Cached ads performance data |
| `last_synced_at` | TIMESTAMPTZ | Last sync timestamp |
| `expires_at` | TIMESTAMPTZ | Cache expiration timestamp |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |

### RPC Functions

- `get_valid_ads_performance_cache()` - Retrieve valid cached data
- `store_ads_performance_cache()` - Store new cache entry
- `cleanup_ads_performance_cache()` - Clean up expired entries
- `log_ads_performance_cache_stats()` - Get cache statistics

## Cron Jobs

### Automatic Cleanup
- **Schedule**: Every 15 minutes
- **Function**: `cleanup_ads_performance_cache()`
- **Purpose**: Remove expired cache entries

### Daily Statistics
- **Schedule**: Every day at 9 AM
- **Function**: `log_ads_performance_cache_stats()`
- **Purpose**: Log cache usage statistics

## Error Handling

### Rate Limiting
- **Cooldown period**: 15 minutes
- **Trigger**: Facebook API rate limit errors
- **Behavior**: Returns cached data or throws error

### Cache Failures
- **Supabase errors**: Falls back to Facebook API
- **Facebook API errors**: Throws descriptive error
- **Network errors**: Retries with exponential backoff

## Monitoring

### Console Logs
The system provides detailed logging:
- 🔍 Cache checks
- ✅ Cache hits
- ❌ Cache misses
- 💾 Cache storage
- 🧹 Cache cleanup

### Database Monitoring
Use the management commands to monitor:
- Cache hit rates
- Storage usage
- Cleanup effectiveness
- Error rates

## Troubleshooting

### Common Issues

1. **Cache not working**
   - Check if RPC functions exist
   - Verify user permissions
   - Check console for errors

2. **Data not updating**
   - Check cache expiration times
   - Verify Facebook API credentials
   - Check rate limit status

3. **Performance issues**
   - Monitor cache hit rates
   - Check database indexes
   - Verify cron job execution

### Debug Commands

```bash
# Check cache status
npm run ads-cache:status

# View recent logs
npm run ads-cache:logs

# Test cache functions
npm run ads-cache:test
```

## Security

- **Row Level Security**: Users can only access their own cache
- **Authentication**: Requires valid Supabase session
- **Data isolation**: Cache entries are user-specific
- **Automatic cleanup**: Prevents data accumulation

## Performance

- **Fast access**: In-memory cache for recent data
- **Persistence**: Supabase cache for cross-session data
- **Efficient queries**: Indexed lookups
- **Batch operations**: Single Facebook API call per fetch
- **Automatic cleanup**: Prevents database bloat
