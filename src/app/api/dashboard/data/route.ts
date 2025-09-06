// API endpoint for centralized dashboard data
// This demonstrates how the centralized service can be used from the backend

import { NextRequest, NextResponse } from 'next/server';
import { fetchDashboardData, clearDashboardCache } from '@/lib/dashboard-api-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timeRange = searchParams.get('timeRange') || 'week';
    const clearCache = searchParams.get('clearCache') === 'true';

    // Clear cache if requested
    if (clearCache) {
      clearDashboardCache();
    }

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Fetch dashboard data using centralized service
    const dashboardData = await fetchDashboardData({
      startDate: start,
      endDate: end,
      timeRange: timeRange,
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear-cache') {
      clearDashboardCache();
      return NextResponse.json({
        success: true,
        message: 'Dashboard cache cleared successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing POST request:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
