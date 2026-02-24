import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, customerId, customerName, customerCurrency } = body;

        if (!userId || !customerId) {
            return NextResponse.json({ error: 'User ID and Customer ID are required' }, { status: 400 });
        }

        const { data: updateData, error } = await supabaseAdmin
            .from('googleAdsData')
            .update({
                customer_id: customerId,
                customer_name: customerName || 'Google Ads Account',
                customer_currency: customerCurrency || 'USD',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Error updating Google Ads customer in Supabase:', error);
            return NextResponse.json({ error: 'Failed to update Google Ads customer' }, { status: 500 });
        }

        return NextResponse.json({ success: true, customer: updateData[0] });
    } catch (error) {
        console.error('SERVER ERROR in Google Ads Select API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
