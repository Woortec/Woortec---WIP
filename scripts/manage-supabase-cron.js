#!/usr/bin/env node

/**
 * Supabase Cron Management Script
 * 
 * This script helps you manage Supabase cron jobs for dashboard cache cleanup.
 * 
 * Usage:
 *   node scripts/manage-supabase-cron.js [command]
 * 
 * Commands:
 *   - setup: Run the SQL setup script
 *   - status: Check cron job status
 *   - test: Test the cleanup function
 *   - logs: View recent cron job logs
 *   - remove: Remove all dashboard cron jobs
 * 
 * Environment Variables Required:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client with service role key
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

async function runSqlFile(filename) {
  try {
    const sqlPath = path.join(__dirname, filename);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log(`📄 Running SQL file: ${filename}`);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`🔧 Executing: ${statement.substring(0, 50)}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`⚠️  Warning: ${error.message}`);
        } else {
          console.log(`✅ Success`);
        }
      }
    }
    
  } catch (error) {
    console.error(`❌ Error running SQL file: ${error.message}`);
  }
}

async function checkCronStatus() {
  try {
    console.log('📊 Checking Supabase cron job status...');
    
    // Check if pg_cron extension is enabled
    const { data: extensions, error: extError } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'pg_cron');
    
    if (extError) {
      console.log('⚠️  Could not check pg_cron extension status');
    } else if (extensions && extensions.length > 0) {
      console.log('✅ pg_cron extension is enabled');
    } else {
      console.log('❌ pg_cron extension is not enabled');
      console.log('💡 You may need to enable it in your Supabase dashboard');
    }
    
    // Check scheduled jobs
    const { data: jobs, error: jobsError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT jobid, schedule, command, active FROM cron.job WHERE command LIKE '%dashboard%'" 
      });
    
    if (jobsError) {
      console.log('⚠️  Could not fetch cron jobs:', jobsError.message);
    } else {
      console.log('📋 Dashboard cron jobs:');
      if (jobs && jobs.length > 0) {
        jobs.forEach(job => {
          console.log(`   - Job ${job.jobid}: ${job.schedule} (${job.active ? 'active' : 'inactive'})`);
          console.log(`     Command: ${job.command}`);
        });
      } else {
        console.log('   No dashboard cron jobs found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking cron status:', error.message);
  }
}

async function testCleanupFunction() {
  try {
    console.log('🧪 Testing cleanup function...');
    
    const { data, error } = await supabase
      .rpc('cleanup_dashboard_cache');
    
    if (error) {
      console.error('❌ Error testing cleanup function:', error.message);
    } else {
      console.log('✅ Cleanup function test results:');
      console.log(`   - Expired entries deleted: ${data[0]?.expired_deleted || 0}`);
      console.log(`   - Old entries deleted: ${data[0]?.old_deleted || 0}`);
      console.log(`   - Current entries: ${data[0]?.current_entries || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing cleanup function:', error.message);
  }
}

async function viewCronLogs() {
  try {
    console.log('📜 Viewing recent cron job logs...');
    
    const { data: logs, error } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            jobid,
            status,
            return_message,
            start_time,
            end_time
          FROM cron.job_run_details 
          WHERE command LIKE '%dashboard%'
          ORDER BY start_time DESC 
          LIMIT 10
        ` 
      });
    
    if (logsError) {
      console.log('⚠️  Could not fetch cron logs:', logsError.message);
    } else {
      console.log('📋 Recent cron job logs:');
      if (logs && logs.length > 0) {
        logs.forEach(log => {
          console.log(`   - Job ${log.jobid}: ${log.status} at ${log.start_time}`);
          if (log.return_message) {
            console.log(`     Message: ${log.return_message}`);
          }
        });
      } else {
        console.log('   No recent logs found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error viewing cron logs:', error.message);
  }
}

async function removeCronJobs() {
  try {
    console.log('🗑️  Removing dashboard cron jobs...');
    
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT cron.unschedule('dashboard-cache-cleanup')" 
      });
    
    const { data: data2, error: error2 } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT cron.unschedule('dashboard-cache-stats')" 
      });
    
    if (error || error2) {
      console.log('⚠️  Some jobs may not have been removed:', error?.message || error2?.message);
    } else {
      console.log('✅ All dashboard cron jobs removed');
    }
    
  } catch (error) {
    console.error('❌ Error removing cron jobs:', error.message);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      await runSqlFile('setup-supabase-cron.sql');
      break;
    case 'status':
      await checkCronStatus();
      break;
    case 'test':
      await testCleanupFunction();
      break;
    case 'logs':
      await viewCronLogs();
      break;
    case 'remove':
      await removeCronJobs();
      break;
    default:
      console.log('📋 Supabase Cron Management');
      console.log('');
      console.log('Usage: node scripts/manage-supabase-cron.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  setup   - Run the SQL setup script');
      console.log('  status  - Check cron job status');
      console.log('  test    - Test the cleanup function');
      console.log('  logs    - View recent cron job logs');
      console.log('  remove  - Remove all dashboard cron jobs');
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  checkCronStatus,
  testCleanupFunction,
  viewCronLogs,
  removeCronJobs
};
