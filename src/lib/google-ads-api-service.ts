// Google Ads API Service
// Fetches dashboard data from Google Ads API

import { createClient } from '@supabase/supabase-js';

export interface GoogleAdsDashboardData {
    budget: {
        value: string;
        diff: number;
        trend: 'up' | 'down';
        currency: string;
    };
    impressions: {
        value: string;
        diff: number;
        trend: 'up' | 'down';
    };
    clicks: {
        value: string;
        diff: number;
        trend: 'up' | 'down';
    };
    ctr: {
        value: string;
        diff: number;
        trend: 'up' | 'down';
    };
    reach: {
        value: string;
        diff: number;
        trend: 'up' | 'down';
    };
    adSpend: {
        value: string;
        diff: number;
        trend: 'up' | 'down';
        currency: string;
    };
    adsRunning: {
        value: string;
        diff: number;
        trend: 'up' | 'down';
    };
}

export interface GoogleAdsApiParams {
    startDate: string;
    endDate: string;
    timeRange: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';
}

/**
 * Fetch Google Ads dashboard data
 */
export async function fetchGoogleAdsDashboardData(
    params: GoogleAdsApiParams
): Promise<GoogleAdsDashboardData> {
    try {
        console.log('🔄 Fetching Google Ads data with params:', params);

        // Get user ID from localStorage
        const userId = localStorage.getItem('userid');
        if (!userId) {
            throw new Error('User ID not found');
        }

        // Call our internal API route which handles the server-side Google Ads communication
        const response = await fetch('/api/google-ads/dashboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                startDate: params.startDate,
                endDate: params.endDate
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch Google Ads data');
        }

        const metrics = await response.json();
        console.log('✅ Google Ads data fetched successfully:', metrics);

        return metrics;
    } catch (error) {
        console.error('❌ Error fetching Google Ads data:', error);
        throw error;
    }
}

// Helper functions below are no longer needed on client side as they moved to server
