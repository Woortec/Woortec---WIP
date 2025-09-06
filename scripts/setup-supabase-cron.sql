-- =====================================================
-- Supabase Cron Setup for Dashboard Cache Cleanup
-- =====================================================
-- This script sets up automatic cache cleanup using Supabase's built-in pg_cron extension
-- 
-- Benefits over Vercel cron:
-- - Runs directly in the database (faster)
-- - No external API calls needed
-- - More reliable (no cold starts)
-- - Better error handling and logging
-- =====================================================

-- Enable the pg_cron extension (if not already enabled)
-- Note: This might need to be done by a superuser in some Supabase plans
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- 1. Create a function to clean up expired cache entries
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_dashboard_cache()
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
    one_day_ago TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get timestamp for 24 hours ago
    one_day_ago := NOW() - INTERVAL '24 hours';
    
    -- Delete expired cache entries (older than 1 hour)
    WITH deleted_expired AS (
        DELETE FROM dashboard_cache 
        WHERE expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO expired_count FROM deleted_expired;
    
    -- Delete entries older than 24 hours (safety net)
    WITH deleted_old AS (
        DELETE FROM dashboard_cache 
        WHERE created_at < one_day_ago
        RETURNING id
    )
    SELECT COUNT(*) INTO old_count FROM deleted_old;
    
    -- Get current cache entry count
    SELECT COUNT(*) INTO current_count FROM dashboard_cache;
    
    -- Log the cleanup results
    RAISE NOTICE 'Cache cleanup completed: % expired entries deleted, % old entries deleted, % current entries remaining', 
        expired_count, old_count, current_count;
    
    -- Return the results
    RETURN QUERY SELECT expired_count, old_count, current_count;
END;
$$;

-- =====================================================
-- 2. Schedule the cleanup job to run every hour
-- =====================================================
-- Schedule: Every hour at minute 0 (0 * * * *)
-- This will run at: 00:00, 01:00, 02:00, etc.
SELECT cron.schedule(
    'dashboard-cache-cleanup',           -- Job name
    '0 * * * *',                        -- Cron schedule: every hour
    'SELECT cleanup_dashboard_cache();' -- SQL to execute
);

-- =====================================================
-- 3. Create a function for daily stats report
-- =====================================================
CREATE OR REPLACE FUNCTION log_dashboard_cache_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_entries INTEGER;
    expired_entries INTEGER;
    unique_users INTEGER;
BEGIN
    -- Get statistics
    SELECT COUNT(*) INTO total_entries FROM dashboard_cache;
    SELECT COUNT(*) INTO expired_entries FROM dashboard_cache WHERE expires_at < NOW();
    SELECT COUNT(DISTINCT user_id) INTO unique_users FROM dashboard_cache WHERE user_id IS NOT NULL;
    
    -- Log the statistics
    RAISE NOTICE 'Daily cache stats: % total entries, % expired entries, % unique users', 
        total_entries, expired_entries, unique_users;
END;
$$;

-- =====================================================
-- 4. Schedule the daily stats report
-- =====================================================
-- This will run daily at 9 AM to log cache statistics
SELECT cron.schedule(
    'dashboard-cache-stats',             -- Job name
    '0 9 * * *',                        -- Cron schedule: daily at 9 AM
    'SELECT log_dashboard_cache_stats();' -- SQL to execute
);

-- =====================================================
-- 5. Grant necessary permissions
-- =====================================================
-- Grant execute permission to authenticated users (if needed)
GRANT EXECUTE ON FUNCTION cleanup_dashboard_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION log_dashboard_cache_stats() TO authenticated;

-- =====================================================
-- 6. View scheduled jobs (for verification)
-- =====================================================
-- Run this query to see all scheduled cron jobs
SELECT 
    jobid,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active
FROM cron.job 
WHERE command LIKE '%dashboard%';

-- =====================================================
-- 7. Test the functions manually
-- =====================================================
-- Uncomment the lines below to test the functions
-- SELECT * FROM cleanup_dashboard_cache();
-- SELECT log_dashboard_cache_stats();

-- =====================================================
-- 8. View recent cron job runs (for monitoring)
-- =====================================================
-- This will show the last 10 cron job executions
SELECT 
    jobid,
    runid,
    job_pid,
    database,
    username,
    command,
    status,
    return_message,
    start_time,
    end_time
FROM cron.job_run_details 
WHERE command LIKE '%dashboard%'
ORDER BY start_time DESC 
LIMIT 10;
