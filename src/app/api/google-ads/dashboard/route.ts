import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for server-side operations
// We use the service role key to securely access the database
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Fallback to anon key if service role is missing, but preferably use service role
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { startDate, endDate, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Get Google Ads credentials from Supabase
        // We use the admin client to bypass potential RLS issues on the server side
        const { data: googleAdsData, error } = await supabaseAdmin
            .from('googleAdsData')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !googleAdsData) {
            console.error('❌ No Google Ads connection found for user:', userId);
            return NextResponse.json({ error: 'Google Ads account not connected' }, { status: 404 });
        }

        // 2. Refresh token if needed
        let accessToken = googleAdsData.access_token;
        const tokenExpiry = new Date(googleAdsData.token_expiry);
        const now = new Date();

        // Access tokens typically expire in 1 hour. If the expiry is suspiciously far in the future, it's corrupted.
        const isCorruptedExpiry = tokenExpiry.getTime() > now.getTime() + 24 * 60 * 60 * 1000;

        if (now >= tokenExpiry || isCorruptedExpiry) {
            console.log('🔄 Access token expired (or expiry date corrupted), refreshing...');

            try {
                const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
                        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
                        refresh_token: googleAdsData.refresh_token,
                        grant_type: 'refresh_token',
                    }),
                });

                if (!refreshResponse.ok) {
                    const errorText = await refreshResponse.text();
                    console.error('❌ Failed to refresh token:', errorText);
                    // Proceed with old token, it might still have a grace period, or fail downstream
                } else {
                    const tokens = await refreshResponse.json();
                    accessToken = tokens.access_token;

                    // Update Supabase with new token
                    const newExpiry = new Date(Date.now() + (tokens.expires_in * 1000));
                    await supabaseAdmin
                        .from('googleAdsData')
                        .update({
                            access_token: accessToken,
                            token_expiry: newExpiry.toISOString(),
                        })
                        .eq('user_id', userId);

                    console.log('✅ Token refreshed and saved successfully');
                }
            } catch (refreshError) {
                console.error('❌ Token refresh exception:', refreshError);
            }
        }

        // 3. Fetch Data from Google Ads API
        const customerId = googleAdsData.customer_id.replace(/-/g, '');
        const query = `
      SELECT 
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.cost_micros,
        campaign.status
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;

        // Verify developer token (security: don't log full token)
        const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
        console.log(`🔍 Using Developer Token: ${devToken ? 'Yes (Present)' : 'No (Missing!)'}`);
        console.log(`🔍 Target Customer ID: ${customerId}`);

        // --- DIAGNOSTIC START ---
        // Check if we can list accessible customers (tests API enabled status)
        try {
            const listRes = await fetch(
                `https://googleads.googleapis.com/v22/customers:listAccessibleCustomers`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'developer-token': devToken || '',
                        'Content-Type': 'application/json',
                    }
                }
            );
            const listText = await listRes.text();
            console.log('🔍 API Health Check (listAccessibleCustomers):', listRes.status, listRes.statusText);
            if (listRes.status !== 200) {
                console.error('❌ Health Check Failed:', listText);
                // If this fails with 501, the API is NOT enabled.
            } else {
                console.log('✅ API Health Check Passed. Accessible Accounts:', listText);
            }
        } catch (e) {
            console.error('❌ Health Check Exception:', e);
        }
        // --- DIAGNOSTIC END ---

        // Sanitize login customer ID (must not have dashes)
        const rawLoginId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || customerId;
        const loginIds = rawLoginId.replace(/-/g, '');

        console.log(`🔍 Sanitized Login Customer ID: ${loginIds}`);

        const response = await fetch(
            `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'developer-token': devToken || '',
                    'login-customer-id': loginIds,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Google Ads API error:', errorText);

            // Handle DEVELOPER_TOKEN_NOT_APPROVED gracefully
            if (response.status === 403 && errorText.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
                console.warn('⚠️ Developer token not approved for production. Returning mock/empty data.');
                return NextResponse.json({
                    budget: { value: '0.00', diff: 0, trend: 'up', currency: 'USD' },
                    impressions: { value: '0', diff: 0, trend: 'up' },
                    clicks: { value: '0', diff: 0, trend: 'up' },
                    ctr: { value: '0.00%', diff: 0, trend: 'up' },
                    reach: { value: '0', diff: 0, trend: 'up' },
                    adSpend: { value: '0.00', diff: 0, trend: 'up', currency: 'USD' },
                    adsRunning: { value: '0', diff: 0, trend: 'up' }
                });
            }

            return NextResponse.json({ error: `Google Ads API error: ${response.statusText}`, details: errorText }, { status: response.status });
        }

        const data = await response.json();

        // 4. Process and Aggregate Data
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalCost = 0;
        let activeCampaigns = 0;

        if (data.results) {
            data.results.forEach((result: any) => {
                totalImpressions += parseInt(result.metrics?.impressions || '0');
                totalClicks += parseInt(result.metrics?.clicks || '0');
                totalCost += parseInt(result.metrics?.costMicros || '0');
                if (result.campaign?.status === 'ENABLED') {
                    activeCampaigns++;
                }
            });
        }

        const costInDollars = totalCost / 1000000;
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        // 5. Return formatted data matching Dashboard structure
        const dashboardData = {
            budget: {
                value: costInDollars.toFixed(2),
                diff: 0,
                trend: 'up',
                currency: 'USD',
            },
            impressions: {
                value: totalImpressions.toLocaleString(),
                diff: 0,
                trend: 'up',
            },
            clicks: {
                value: totalClicks.toLocaleString(),
                diff: 0,
                trend: 'up',
            },
            ctr: {
                value: ctr.toFixed(2) + '%',
                diff: 0,
                trend: 'up',
            },
            reach: {
                value: totalImpressions.toLocaleString(), // Approx for reach
                diff: 0,
                trend: 'up',
            },
            adSpend: {
                value: costInDollars.toFixed(2),
                diff: 0,
                trend: 'up',
                currency: 'USD',
            },
            adsRunning: {
                value: activeCampaigns.toString(),
                diff: 0,
                trend: 'up',
            },
        };

        return NextResponse.json(dashboardData);

    } catch (error) {
        console.error('SERVER ERROR in Google Ads Dashboard API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
