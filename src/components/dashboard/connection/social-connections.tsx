'use client';

import React, { useEffect, useState } from 'react';
import { Facebook as FacebookIcon } from '@mui/icons-material';
import { Button, Card, Grid, Stack, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import { createClient } from '../../../../utils/supabase/client';
import AdAccountSelectionModal from './AdAccountSelectionModal';
import PageSelectionModal from './PageSelectionModal';
import styles from './styles/Connect.module.css';

const loadFacebookSDK = () => {
  return new Promise<void>((resolve) => {
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: '843123844562723',
        cookie: true,
        xfbml: true,
        version: 'v21.0',
      });
      resolve();
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });
};

export interface ConnectProps {
  sx?: SxProps;
}

export function Connect({ sx }: ConnectProps): React.JSX.Element {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadFacebookSDK().then(() => setIsSdkLoaded(true));
    checkUserConnection();
  }, []);

  const checkUserConnection = async () => {
    const localUserId = localStorage.getItem('userid');
    if (!localUserId) return;

    const { data, error } = await supabase
      .from('facebookData')
      .select('*')
      .eq('user_id', localUserId);

    if (error) {
      console.error('Error checking user connection:', error);
      return;
    }

    if (data && data.length > 0) {
      const { access_token, expires_at } = data[0];

      if (new Date().getTime() < new Date(expires_at).getTime()) {
        setAccessToken(access_token);
        setUserId(data[0].fb_user_id);
        setIsConnected(true);
      } else {
        refreshLongLivedToken(access_token, localUserId);
      }
    }
  };

  const refreshLongLivedToken = async (token: string, userId: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=843123844562723&client_secret=YOUR_APP_SECRET&fb_exchange_token=${token}`
      );
      const data = await response.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        await storeTokenInSupabase(data.access_token, userId, 60 * 24 * 60 * 60 * 1000); // Store refreshed token
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const handleFacebookLogin = () => {
    if ((window as any).FB) {
      (window as any).FB.login(
        async (response: any) => {
          if (response.authResponse) {
            const shortLivedToken = response.authResponse.accessToken;
            const userId = response.authResponse.userID;

            const longLivedToken = await exchangeForLongLivedToken(shortLivedToken);
            if (longLivedToken) {
              setAccessToken(longLivedToken);
              await storeTokenInSupabase(longLivedToken, userId, 60 * 24 * 60 * 60 * 1000);
              setIsConnected(true);
            }
          }
        },
        { scope: 'ads_read, pages_show_list' }
      );
    }
  };

  const exchangeForLongLivedToken = async (shortLivedToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=843123844562723&client_secret=YOUR_APP_SECRET&fb_exchange_token=${shortLivedToken}`
      );
      const data = await response.json();

      if (data.access_token) {
        return data.access_token;
      }
      throw new Error('Failed to exchange for long-lived token');
    } catch (error) {
      console.error('Error exchanging token:', error);
      return null;
    }
  };

  const storeTokenInSupabase = async (token: string, userId: string, ttl: number) => {
    const expiresAt = new Date().getTime() + ttl;

    const { error } = await supabase
      .from('facebookData')
      .upsert({
        user_id: userId,
        access_token: token,
        expires_at: new Date(expiresAt).toISOString(),
      });

    if (error) {
      console.error('Error storing token in Supabase:', error);
    }
  };

  const handleDisconnect = async () => {
    setAccessToken(null);
    setIsConnected(false);
    localStorage.removeItem('userid');

    const userId = localStorage.getItem('userid');
    if (userId) {
      await supabase.from('facebookData').delete().eq('user_id', userId);
    }
  };

  return (
    <Stack className={styles.container}>
      <Typography variant="h5">Connect with Facebook</Typography>
      {isConnected ? (
        <Button onClick={handleDisconnect} sx={{ backgroundColor: 'red', color: 'white' }}>
          Disconnect
        </Button>
      ) : (
        <Button onClick={handleFacebookLogin} sx={{ backgroundColor: 'blue', color: 'white' }}>
          Connect to Facebook
        </Button>
      )}
    </Stack>
  );
}
