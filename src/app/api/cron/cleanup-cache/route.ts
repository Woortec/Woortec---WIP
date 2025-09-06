import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🧹 Starting dashboard cache cleanup...');
    
    // Get current timestamp
    const now = new Date().toISOString();
    console.log(`⏰ Cleanup time: ${now}`);
    
    // Delete expired cache entries
    const { data, error } = await supabase
      .from('dashboard_cache')
      .delete()
      .lt('expires_at', now)
      .select('id');
    
    if (error) {
      throw error;
    }
    
    const expiredCount = data?.length || 0;
    console.log(`✅ Cleanup completed successfully!`);
    console.log(`🗑️  Deleted ${expiredCount} expired cache entries`);
    
    // Also clean up entries older than 24 hours (safety net)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: oldData, error: oldError } = await supabase
      .from('dashboard_cache')
      .delete()
      .lt('created_at', oneDayAgo)
      .select('id');
    
    if (oldError) {
      console.warn('⚠️  Warning: Failed to clean up old entries:', oldError.message);
    } else {
      const oldCount = oldData?.length || 0;
      console.log(`🗑️  Deleted ${oldCount} entries older than 24 hours`);
    }
    
    // Get current cache statistics
    const { data: stats, error: statsError } = await supabase
      .from('dashboard_cache')
      .select('id');
    
    const currentEntries = stats?.length || 0;
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleanup completed',
      deleted: {
        expired: expiredCount,
        old: oldData?.length || 0
      },
      currentEntries
    });

  } catch (error) {
    console.error('❌ Error during cache cleanup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
