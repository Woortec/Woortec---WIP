#!/usr/bin/env node

/**
 * Dashboard Cache Cleanup Script
 * 
 * This script automatically cleans up expired dashboard cache entries from Supabase.
 * Run this script every hour via cron job or as a scheduled task.
 * 
 * Usage:
 *   node scripts/cleanup-dashboard-cache.js
 * 
 * Environment Variables Required:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin access)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function cleanupExpiredCache() {
  try {
    console.log('🧹 Starting dashboard cache cleanup...');
    
    // Get current timestamp
    const now = new Date().toISOString();
    console.log(`⏰ Cleanup time: ${now}`);
    
    // Delete expired cache entries
    const { data, error, count } = await supabase
      .from('dashboard_cache')
      .delete()
      .lt('expires_at', now)
      .select('id', { count: 'exact' });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Cleanup completed successfully!`);
    console.log(`🗑️  Deleted ${count || 0} expired cache entries`);
    
    // Also clean up entries older than 24 hours (safety net)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: oldData, error: oldError, count: oldCount } = await supabase
      .from('dashboard_cache')
      .delete()
      .lt('created_at', oneDayAgo)
      .select('id', { count: 'exact' });
    
    if (oldError) {
      console.warn('⚠️  Warning: Failed to clean up old entries:', oldError.message);
    } else {
      console.log(`🗑️  Deleted ${oldCount || 0} entries older than 24 hours`);
    }
    
    // Get current cache statistics
    const { data: stats, error: statsError } = await supabase
      .from('dashboard_cache')
      .select('id', { count: 'exact' });
    
    if (!statsError) {
      console.log(`📊 Current cache entries: ${stats?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error during cache cleanup:', error.message);
    process.exit(1);
  }
}

async function getCacheStats() {
  try {
    console.log('📊 Getting cache statistics...');
    
    // Get total cache entries
    const { data: total, error: totalError } = await supabase
      .from('dashboard_cache')
      .select('id', { count: 'exact' });
    
    if (totalError) throw totalError;
    
    // Get expired entries
    const now = new Date().toISOString();
    const { data: expired, error: expiredError } = await supabase
      .from('dashboard_cache')
      .select('id', { count: 'exact' })
      .lt('expires_at', now);
    
    if (expiredError) throw expiredError;
    
    // Get entries by user
    const { data: byUser, error: byUserError } = await supabase
      .from('dashboard_cache')
      .select('user_id')
      .not('user_id', 'is', null);
    
    if (byUserError) throw byUserError;
    
    const uniqueUsers = new Set(byUser?.map(entry => entry.user_id) || []).size;
    
    console.log('📈 Cache Statistics:');
    console.log(`   Total entries: ${total?.length || 0}`);
    console.log(`   Expired entries: ${expired?.length || 0}`);
    console.log(`   Active users: ${uniqueUsers}`);
    
  } catch (error) {
    console.error('❌ Error getting cache stats:', error.message);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'stats':
      await getCacheStats();
      break;
    case 'cleanup':
    default:
      await cleanupExpiredCache();
      break;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Cleanup script interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cleanup script terminated');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  cleanupExpiredCache,
  getCacheStats
};
