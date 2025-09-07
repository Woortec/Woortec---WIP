#!/usr/bin/env node

/**
 * Ads Performance Cache Management Script
 * This script helps manage the ads performance cache in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCache() {
  console.log('🚀 Setting up ads performance cache...');
  
  try {
    // Read and execute the SQL setup script
    const fs = require('fs');
    const path = require('path');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-ads-performance-cache.sql'), 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Error setting up cache:', error.message);
      return false;
    }
    
    console.log('✅ Ads performance cache setup completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error reading setup script:', error.message);
    return false;
  }
}

async function checkCacheStatus() {
  console.log('📊 Checking ads performance cache status...');
  
  try {
    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('ads_performance_cache')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Cache table does not exist or is not accessible');
      return;
    }
    
    // Get cache statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('log_ads_performance_cache_stats');
    
    if (statsError) {
      console.error('❌ Error getting cache stats:', statsError.message);
      return;
    }
    
    if (stats && stats.length > 0) {
      const stat = stats[0];
      console.log('📈 Cache Statistics:');
      console.log(`   Total entries: ${stat.total_entries}`);
      console.log(`   Fresh entries: ${stat.fresh_entries}`);
      console.log(`   Expired entries: ${stat.expired_entries}`);
      console.log(`   Oldest entry: ${stat.oldest_entry || 'None'}`);
      console.log(`   Newest entry: ${stat.newest_entry || 'None'}`);
    }
    
    // Check cron jobs
    const { data: cronJobs, error: cronError } = await supabase
      .from('cron.job')
      .select('*')
      .like('command', '%ads-performance%');
    
    if (cronError) {
      console.log('⚠️ Could not check cron jobs (pg_cron might not be available)');
    } else if (cronJobs && cronJobs.length > 0) {
      console.log('⏰ Active cron jobs:');
      cronJobs.forEach(job => {
        console.log(`   - ${job.jobname}: ${job.schedule}`);
      });
    } else {
      console.log('⚠️ No ads performance cache cron jobs found');
    }
    
  } catch (error) {
    console.error('❌ Error checking cache status:', error.message);
  }
}

async function testCache() {
  console.log('🧪 Testing ads performance cache functions...');
  
  try {
    // Test cleanup function
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_ads_performance_cache');
    
    if (cleanupError) {
      console.error('❌ Error testing cleanup function:', cleanupError.message);
    } else {
      console.log('✅ Cleanup function test successful:', cleanupResult);
    }
    
    // Test stats function
    const { data: statsResult, error: statsError } = await supabase
      .rpc('log_ads_performance_cache_stats');
    
    if (statsError) {
      console.error('❌ Error testing stats function:', statsError.message);
    } else {
      console.log('✅ Stats function test successful:', statsResult);
    }
    
  } catch (error) {
    console.error('❌ Error testing cache functions:', error.message);
  }
}

async function viewCacheLogs() {
  console.log('📋 Viewing recent cache logs...');
  
  try {
    // Get recent cron job runs
    const { data: cronLogs, error: cronError } = await supabase
      .from('cron.job_run_details')
      .select('*')
      .like('command', '%ads-performance%')
      .order('start_time', { ascending: false })
      .limit(10);
    
    if (cronError) {
      console.log('⚠️ Could not retrieve cron logs (pg_cron might not be available)');
    } else if (cronLogs && cronLogs.length > 0) {
      console.log('📊 Recent cache operations:');
      cronLogs.forEach(log => {
        const status = log.status === 'succeeded' ? '✅' : '❌';
        console.log(`   ${status} ${log.start_time}: ${log.status}`);
        if (log.return_message) {
          console.log(`      ${log.return_message}`);
        }
      });
    } else {
      console.log('📭 No recent cache operations found');
    }
    
  } catch (error) {
    console.error('❌ Error viewing cache logs:', error.message);
  }
}

async function removeCache() {
  console.log('🗑️ Removing ads performance cache...');
  
  try {
    // Remove cron jobs first
    const { error: cronError } = await supabase
      .rpc('cron.unschedule', { jobname: 'cleanup-ads-performance-cache' });
    
    if (cronError) {
      console.log('⚠️ Could not remove cron job (might not exist):', cronError.message);
    } else {
      console.log('✅ Removed cleanup cron job');
    }
    
    const { error: statsError } = await supabase
      .rpc('cron.unschedule', { jobname: 'log-ads-performance-cache-stats' });
    
    if (statsError) {
      console.log('⚠️ Could not remove stats cron job (might not exist):', statsError.message);
    } else {
      console.log('✅ Removed stats cron job');
    }
    
    // Drop the table
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS ads_performance_cache CASCADE;' 
      });
    
    if (dropError) {
      console.error('❌ Error dropping cache table:', dropError.message);
    } else {
      console.log('✅ Dropped ads_performance_cache table');
    }
    
    console.log('✅ Ads performance cache removal completed');
    
  } catch (error) {
    console.error('❌ Error removing cache:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  
  console.log('🔧 Ads Performance Cache Management Tool');
  console.log('=====================================\n');
  
  switch (command) {
    case 'setup':
      await setupCache();
      break;
    case 'status':
      await checkCacheStatus();
      break;
    case 'test':
      await testCache();
      break;
    case 'logs':
      await viewCacheLogs();
      break;
    case 'remove':
      await removeCache();
      break;
    default:
      console.log('Usage: node manage-ads-performance-cache.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  setup   - Set up the ads performance cache table and functions');
      console.log('  status  - Check cache status and statistics');
      console.log('  test    - Test cache functions');
      console.log('  logs    - View recent cache operation logs');
      console.log('  remove  - Remove the cache table and cron jobs');
      console.log('');
      console.log('Examples:');
      console.log('  node manage-ads-performance-cache.js setup');
      console.log('  node manage-ads-performance-cache.js status');
      break;
  }
}

main().catch(console.error);
