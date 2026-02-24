import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ADS_CLIENT_ID,
    process.env.GOOGLE_ADS_CLIENT_SECRET,
    process.env.GOOGLE_ADS_REDIRECT_URI
);

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // This contains the userId
        const error = searchParams.get('error');

        // Handle user denial
        if (error === 'access_denied') {
            return NextResponse.redirect(
                new URL('http://app.localhost:3000/dashboard/connection?error=access_denied')
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL('http://app.localhost:3000/dashboard/connection?error=invalid_request')
            );
        }

        const userId = state;
        console.log('📝 Google Ads OAuth Callback - userId from state:', userId);

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        console.log('✅ Tokens received:', { hasAccessToken: !!tokens.access_token, hasRefreshToken: !!tokens.refresh_token });

        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.redirect(
                new URL('http://app.localhost:3000/dashboard/connection?error=token_exchange_failed')
            );
        }

        // Set credentials to make API calls
        oauth2Client.setCredentials(tokens);

        // Fetch Google Ads customer accounts
        const customerAccounts = await fetchGoogleAdsAccounts(tokens.access_token);
        console.log('📊 Customer accounts fetched:', customerAccounts);

        if (!customerAccounts || customerAccounts.length === 0) {
            return NextResponse.redirect(
                new URL('http://app.localhost:3000/dashboard/connection?error=no_accounts_found')
            );
        }

        // Store tokens and account info in Supabase (using service role to bypass RLS)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Check if user already has Google Ads data
        const { data: existingData } = await supabase
            .from('googleAdsData')
            .select('*')
            .eq('user_id', userId)
            .single();

        // tokens.expiry_date is an absolute timestamp (ms since epoch)
        const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000);

        const googleAdsData = {
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expiry: tokenExpiry.toISOString(),
            customer_id: customerAccounts[0].id,
            customer_name: customerAccounts[0].name,
            customer_currency: customerAccounts[0].currency || 'USD',
            updated_at: new Date().toISOString(),
        };

        if (existingData) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('googleAdsData')
                .update(googleAdsData)
                .eq('user_id', userId);

            if (updateError) {
                console.error('❌ Error updating Google Ads data:', updateError);
                return NextResponse.redirect(
                    new URL('http://app.localhost:3000/dashboard/connection?error=database_error')
                );
            }
            console.log('✅ Google Ads data updated successfully');
        } else {
            // Insert new record
            const { error: insertError } = await supabase
                .from('googleAdsData')
                .insert(googleAdsData);

            if (insertError) {
                console.error('❌ Error inserting Google Ads data:', insertError);
                console.error('❌ Data attempted to insert:', googleAdsData);
                return NextResponse.redirect(
                    new URL('http://app.localhost:3000/dashboard/connection?error=database_error')
                );
            }
            console.log('✅ Google Ads data inserted successfully');
        }

        // Redirect back to connections page with success
        return NextResponse.redirect(
            new URL('http://app.localhost:3000/dashboard/connection?success=google_ads_connected')
        );
    } catch (error) {
        console.error('Error in Google Ads OAuth callback:', error);
        return NextResponse.redirect(
            new URL('http://app.localhost:3000/dashboard/connection?error=callback_failed')
        );
    }
}

async function fetchGoogleAdsAccounts(accessToken: string) {
    try {
        console.log('🔍 Fetching accessible customers for the authenticated user...');

        const devToken = process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';

        fs.appendFileSync('google-ads-debug.log', `[${new Date().toISOString()}] Attempting listsAccessibleCustomers with devToken length: ${devToken.length}\n`);

        // 1. Get the list of accessible customer IDs for this user
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
            fs.appendFileSync('google-ads-debug.log', `[${new Date().toISOString()}] ❌ Failed listRes: ${listRes.status} - ${errorText}\n`);
            console.error('❌ Failed to list accessible customers:', errorText);
            return null;
        }

        const listData = await listRes.json();
        fs.appendFileSync('google-ads-debug.log', `[${new Date().toISOString()}] ✅ listData: ${JSON.stringify(listData)}\n`);
        console.log('📊 Accessible customers list:', listData);

        if (!listData.resourceNames || listData.resourceNames.length === 0) {
            console.log('⚠️ No accessible Google Ads accounts found for this user.');
            return [];
        }

        type GoogleAdsAccount = {
            id: string;
            name: string;
            currency: string;
            isManager: boolean;
        };
        const accounts: GoogleAdsAccount[] = [];

        // 2. Fetch details for each accessible customer
        for (const resourceName of listData.resourceNames) {
            const customerId = resourceName.split('/')[1]; // Extracts ID from "customers/1234567890"
            console.log(`🔍 Fetching details for customer ID: ${customerId}`);

            const query = `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.manager FROM customer WHERE customer.id = ${customerId}`;

            try {
                const response = await fetch(
                    `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'developer-token': process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
                            'login-customer-id': customerId, // Use the customer's own ID as the login ID
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query })
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        const customer = data.results[0].customer;
                        // Skip manager accounts if we want to avoid the "Metrics cannot be requested for a manager account" error, 
                        // though a user might ONLY have access to a manager account. We'll store it, but flag it if needed.
                        accounts.push({
                            id: customerId,
                            name: customer.descriptiveName || `Google Ads Account (${customerId})`,
                            currency: customer.currencyCode || 'USD',
                            isManager: customer.manager || false
                        });
                        continue;
                    }
                } else {
                    const errText = await response.text();
                    console.warn(`⚠️ Failed to fetch details for ${customerId}:`, errText);
                }
            } catch (e) {
                console.warn(`⚠️ Error fetching details for customer ${customerId}:`, e);
            }

            // Fallback if detail fetch failed but we know they have access to the ID
            accounts.push({
                id: customerId,
                name: `Google Ads Account (${customerId})`,
                currency: 'USD',
                isManager: false
            });
        }

        // Ideally, we want a client account, not a manager account. 
        // If they only have a manager account, we might need a separate step to pick a child account later, 
        // but for now, prioritize client accounts if available.
        const clientAccounts = accounts.filter(acc => !acc.isManager);

        // Return client accounts first, or all if only manager accounts exist
        const sortedAccounts = clientAccounts.length > 0 ? accounts.sort((a, b) => (a.isManager === b.isManager ? 0 : a.isManager ? 1 : -1)) : accounts;

        return sortedAccounts;

    } catch (error) {
        console.error('❌ Error fetching Google Ads accounts:', error);
        return null;
    }
}
