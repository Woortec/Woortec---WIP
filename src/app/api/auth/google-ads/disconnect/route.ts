import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../../utils/supabase/server.js';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Get the current Google Ads data to revoke the token
        const { data: googleAdsData } = await supabase
            .from('googleAdsData')
            .select('access_token')
            .eq('user_id', userId)
            .single();

        // Revoke the access token with Google
        if (googleAdsData?.access_token) {
            try {
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_ADS_CLIENT_ID,
                    process.env.GOOGLE_ADS_CLIENT_SECRET,
                    process.env.GOOGLE_ADS_REDIRECT_URI
                );

                await oauth2Client.revokeToken(googleAdsData.access_token);
            } catch (revokeError) {
                console.error('Error revoking Google token:', revokeError);
                // Continue with deletion even if revocation fails
            }
        }

        // Delete the Google Ads data from Supabase
        const { error } = await supabase
            .from('googleAdsData')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting Google Ads data:', error);
            return NextResponse.json(
                { error: 'Failed to disconnect Google Ads account' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting Google Ads:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect Google Ads account' },
            { status: 500 }
        );
    }
}
