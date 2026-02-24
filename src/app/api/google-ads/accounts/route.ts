import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { data: googleAdsData, error } = await supabaseAdmin
            .from('googleAdsData')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !googleAdsData) {
            return NextResponse.json({ error: 'Google Ads account not connected' }, { status: 404 });
        }

        const accessToken = googleAdsData.access_token;
        const devToken = process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';

        // Fetch accessible customers
        const listRes = await fetch(
            `https://googleads.googleapis.com/v22/customers:listAccessibleCustomers`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'developer-token': devToken,
                    'Content-Type': 'application/json',
                }
            }
        );

        if (!listRes.ok) {
            const errorText = await listRes.text();
            console.error('Failed listRes:', errorText);
            return NextResponse.json({ error: 'Failed to access Google Ads API' }, { status: 500 });
        }

        const listData = await listRes.json();
        const availableAccounts: any[] = [];

        if (listData.resourceNames) {
            for (const rn of listData.resourceNames) {
                const customerId = rn.split('/')[1];

                // Query for the account itself
                const query = `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.manager, customer.status FROM customer`;
                const searchRes = await fetch(
                    `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'developer-token': devToken,
                            'login-customer-id': customerId,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query })
                    }
                );

                if (searchRes.ok) {
                    const data = await searchRes.json();
                    if (data.results && data.results.length > 0) {
                        const customer = data.results[0].customer;
                        availableAccounts.push({
                            id: customer.id || customerId,
                            name: customer.descriptiveName || `Account (${customerId})`,
                            currency: customer.currencyCode || 'USD',
                            isManager: customer.manager || false,
                            status: customer.status,
                            loginId: customerId
                        });
                    }
                }

                // Query for child clients if it's a manager account
                // Level 1 means direct children
                const childQuery = `SELECT customer_client.id, customer_client.descriptive_name, customer_client.currency_code, customer_client.manager, customer_client.status FROM customer_client WHERE customer_client.level = 1`;
                const childRes = await fetch(
                    `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'developer-token': devToken,
                            'login-customer-id': customerId,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query: childQuery })
                    }
                );

                if (childRes.ok) {
                    const childData = await childRes.json();
                    if (childData.results) {
                        for (const res of childData.results) {
                            if (res.customerClient) {
                                availableAccounts.push({
                                    id: res.customerClient.id,
                                    name: res.customerClient.descriptiveName || `Child Account (${res.customerClient.id})`,
                                    currency: res.customerClient.currencyCode || 'USD',
                                    isManager: res.customerClient.manager || false,
                                    status: res.customerClient.status,
                                    loginId: customerId // We still use the parent customer ID to login
                                });
                            }
                        }
                    }
                }
            }
        }

        // Filter and deduplicate accounts
        const uniqueAccounts: any[] = [];
        const seenIds = new Set();

        // We prefer client accounts (not managers) and ENABLED status
        for (const acc of availableAccounts) {
            if (!seenIds.has(acc.id) && acc.status === 'ENABLED') {
                seenIds.add(acc.id);
                uniqueAccounts.push(acc);
            }
        }

        // Sort: Put non-managers (client accounts) first
        uniqueAccounts.sort((a, b) => {
            if (a.isManager === b.isManager) return 0;
            return a.isManager ? 1 : -1;
        });

        return NextResponse.json({ accounts: uniqueAccounts });
    } catch (error) {
        console.error('Error fetching Google Ads accounts route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
