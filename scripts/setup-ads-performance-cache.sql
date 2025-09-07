-- =====================================================
-- Supabase Cache Setup for Ads Performance Data
-- =====================================================
-- This script creates the ads performance cache table and RPC functions
-- Cache duration: 30 minutes (1800 seconds)
-- =====================================================

-- =====================================================
-- 1. Create ads performance cache table
-- =====================================================
CREATE TABLE IF NOT EXISTS ads_performance_cache (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ad_account_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    time_range TEXT NOT NULL,
    cached_data JSONB NOT NULL,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one cache entry per user/account/date range combination
    UNIQUE(user_id, ad_account_id, start_date, end_date, time_range)
);

-- =====================================================
-- 2. Create indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ads_performance_cache_user_id ON ads_performance_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_performance_cache_expires_at ON ads_performance_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ads_performance_cache_last_synced ON ads_performance_cache(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_ads_performance_cache_lookup ON ads_performance_cache(user_id, ad_account_id, start_date, end_date, time_range);

-- =====================================================
-- 3. Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE ads_performance_cache ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS policies
-- =====================================================
-- Users can only access their own cache entries
CREATE POLICY "Users can access their own ads performance cache" ON ads_performance_cache
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 5. Create function to get valid ads performance cache
-- =====================================================
CREATE OR REPLACE FUNCTION get_valid_ads_performance_cache(
  p_user_id TEXT,
  p_ad_account_id TEXT,
  p_start_date TEXT,
  p_end_date TEXT,
  p_time_range TEXT
)
RETURNS TABLE(
  cached_data JSONB,
  is_fresh BOOLEAN,
  last_synced_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cache_entry RECORD;
  thirty_minutes_ago TIMESTAMPTZ;
BEGIN
  -- Calculate timestamp for 30 minutes ago
  thirty_minutes_ago := NOW() - INTERVAL '30 minutes';
  
  -- Find the cache entry
  SELECT 
    apc.cached_data,
    apc.last_synced_at,
    apc.expires_at,
    (apc.last_synced_at > thirty_minutes_ago) as is_fresh
  INTO cache_entry
  FROM ads_performance_cache apc
  WHERE apc.user_id = p_user_id::UUID
    AND apc.ad_account_id = p_ad_account_id
    AND apc.start_date = p_start_date
    AND apc.end_date = p_end_date
    AND apc.time_range = p_time_range
    AND apc.expires_at > NOW()  -- Only return non-expired entries
  ORDER BY apc.last_synced_at DESC
  LIMIT 1;
  
  -- Return the result
  IF cache_entry IS NOT NULL THEN
    RETURN QUERY SELECT 
      cache_entry.cached_data,
      cache_entry.is_fresh,
      cache_entry.last_synced_at,
      cache_entry.expires_at;
  ELSE
    -- Return empty result
    RETURN QUERY SELECT 
      NULL::JSONB,
      FALSE::BOOLEAN,
      NULL::TIMESTAMPTZ,
      NULL::TIMESTAMPTZ;
  END IF;
END;
$$;

-- =====================================================
-- 6. Create function to store ads performance cache
-- =====================================================
CREATE OR REPLACE FUNCTION store_ads_performance_cache(
  p_user_id TEXT,
  p_ad_account_id TEXT,
  p_start_date TEXT,
  p_end_date TEXT,
  p_time_range TEXT,
  p_cached_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expires_at TIMESTAMPTZ;
BEGIN
  -- Set expiration to 30 minutes from now
  expires_at := NOW() + INTERVAL '30 minutes';
  
  -- Insert or update the cache entry
  INSERT INTO ads_performance_cache (
    user_id,
    ad_account_id,
    start_date,
    end_date,
    time_range,
    cached_data,
    last_synced_at,
    expires_at
  ) VALUES (
    p_user_id::UUID,
    p_ad_account_id,
    p_start_date,
    p_end_date,
    p_time_range,
    p_cached_data,
    NOW(),
    expires_at
  )
  ON CONFLICT (user_id, ad_account_id, start_date, end_date, time_range)
  DO UPDATE SET
    cached_data = EXCLUDED.cached_data,
    last_synced_at = EXCLUDED.last_synced_at,
    expires_at = EXCLUDED.expires_at;
    
  -- Log the operation
  RAISE NOTICE 'Ads performance cache stored for user % with key %-%', p_user_id, p_start_date, p_end_date;
END;
$$;

-- =====================================================
-- 7. Create function to clean up expired ads performance cache entries
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_ads_performance_cache()
RETURNS TABLE(
    expired_deleted INTEGER,
    old_deleted INTEGER,
    current_entries INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER := 0;
    old_count INTEGER := 0;
    current_count INTEGER := 0;
    one_day_ago TIMESTAMPTZ;
BEGIN
    -- Get timestamp for 24 hours ago
    one_day_ago := NOW() - INTERVAL '24 hours';
    
    -- Delete expired cache entries (older than 30 minutes)
    WITH deleted_expired AS (
        DELETE FROM ads_performance_cache 
        WHERE expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO expired_count FROM deleted_expired;
    
    -- Delete entries older than 24 hours (safety net)
    WITH deleted_old AS (
        DELETE FROM ads_performance_cache 
        WHERE created_at < one_day_ago
        RETURNING id
    )
    SELECT COUNT(*) INTO old_count FROM deleted_old;
    
    -- Count remaining entries
    SELECT COUNT(*) INTO current_count FROM ads_performance_cache;
    
    -- Log the cleanup results
    RAISE NOTICE 'Ads performance cache cleanup: % expired deleted, % old deleted, % remaining', 
        expired_count, old_count, current_count;
    
    -- Return the results
    RETURN QUERY SELECT expired_count, old_count, current_count;
END;
$$;

-- =====================================================
-- 8. Grant necessary permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION get_valid_ads_performance_cache TO authenticated;
GRANT EXECUTE ON FUNCTION store_ads_performance_cache TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_ads_performance_cache TO authenticated;

-- =====================================================
-- 9. Set up automatic cleanup with pg_cron (if available)
-- =====================================================
-- Note: This requires pg_cron extension to be enabled
-- Run this only if pg_cron is available in your Supabase instance

-- Schedule cleanup to run every 15 minutes
SELECT cron.schedule(
    'cleanup-ads-performance-cache',
    '*/15 * * * *', -- Every 15 minutes
    'SELECT cleanup_ads_performance_cache();'
);

-- =====================================================
-- 10. Create a function to log cache statistics
-- =====================================================
CREATE OR REPLACE FUNCTION log_ads_performance_cache_stats()
RETURNS TABLE(
    total_entries INTEGER,
    fresh_entries INTEGER,
    expired_entries INTEGER,
    oldest_entry TIMESTAMPTZ,
    newest_entry TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_count INTEGER;
    fresh_count INTEGER;
    expired_count INTEGER;
    oldest_ts TIMESTAMPTZ;
    newest_ts TIMESTAMPTZ;
    thirty_minutes_ago TIMESTAMPTZ;
BEGIN
    thirty_minutes_ago := NOW() - INTERVAL '30 minutes';
    
    -- Get counts
    SELECT COUNT(*) INTO total_count FROM ads_performance_cache;
    SELECT COUNT(*) INTO fresh_count FROM ads_performance_cache WHERE last_synced_at > thirty_minutes_ago;
    SELECT COUNT(*) INTO expired_count FROM ads_performance_cache WHERE expires_at < NOW();
    
    -- Get timestamps
    SELECT MIN(last_synced_at) INTO oldest_ts FROM ads_performance_cache;
    SELECT MAX(last_synced_at) INTO newest_ts FROM ads_performance_cache;
    
    -- Log the stats
    RAISE NOTICE 'Ads performance cache stats: % total, % fresh, % expired, oldest: %, newest: %', 
        total_count, fresh_count, expired_count, oldest_ts, newest_ts;
    
    RETURN QUERY SELECT total_count, fresh_count, expired_count, oldest_ts, newest_ts;
END;
$$;

-- Schedule daily stats logging
SELECT cron.schedule(
    'log-ads-performance-cache-stats',
    '0 9 * * *', -- Every day at 9 AM
    'SELECT log_ads_performance_cache_stats();'
);

-- =====================================================
-- 11. Grant permissions for stats function
-- =====================================================
GRANT EXECUTE ON FUNCTION log_ads_performance_cache_stats TO authenticated;

-- =====================================================
-- 12. Test the setup (optional - remove in production)
-- =====================================================
-- Uncomment these lines to test the functions:
/*
-- Test get function
SELECT * FROM get_valid_ads_performance_cache(
  'your-user-id-here',
  'your-ad-account-id-here', 
  '2024-01-01',
  '2024-01-07',
  'thisWeek'
);

-- Test store function
SELECT store_ads_performance_cache(
  'your-user-id-here',
  'your-ad-account-id-here',
  '2024-01-01', 
  '2024-01-07',
  'thisWeek',
  '{"test": "ads performance data"}'::JSONB
);

-- Test cleanup function
SELECT * FROM cleanup_ads_performance_cache();

-- Test stats function
SELECT * FROM log_ads_performance_cache_stats();
*/
