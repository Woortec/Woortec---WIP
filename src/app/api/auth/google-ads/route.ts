import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ADS_CLIENT_ID,
    process.env.GOOGLE_ADS_CLIENT_SECRET,
    process.env.GOOGLE_ADS_REDIRECT_URI
);

// Google Ads API scope
const SCOPES = ['https://www.googleapis.com/auth/adwords'];

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Generate the authorization URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', // Request refresh token
            scope: SCOPES,
            state: userId, // Pass userId in state to retrieve it in callback
            prompt: 'consent', // Force consent screen to get refresh token
        });

        return NextResponse.json({ authUrl });
    } catch (error) {
        console.error('Error generating Google Ads auth URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate authorization URL' },
            { status: 500 }
        );
    }
}
