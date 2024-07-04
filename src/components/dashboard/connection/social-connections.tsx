'use client';

import React, { useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { Facebook as FacebookIcon } from '@mui/icons-material';
import type { SxProps } from '@mui/system';

const setTokenWithExpiry = (key: string, value: string, ttl: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getTokenWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Failed to parse item from localStorage', error);
    localStorage.removeItem(key);
    return null;
  }
};

const loadFacebookSDK = () => {
  return new Promise<void>((resolve) => {
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId: '961870345497057',
        cookie: true,
        xfbml: true,
        version: 'v19.0'
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

  useEffect(() => {
    loadFacebookSDK().then(() => {
      setIsSdkLoaded(true);
      const token = getTokenWithExpiry('fbAccessToken');
      if (token) {
        // Use the token to make API calls
        (window as any).FB.api('/me/accounts', { access_token: token }, (response: any) => {
          // Handle the response, e.g., connect the page to your app
        });
      }
    });
  }, []);

  const handleFacebookLogin = () => {
    if (!isSdkLoaded) return;
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        // Store the token with a 30-minute expiry
        setTokenWithExpiry('fbAccessToken', accessToken, 30 * 60 * 1000);
        // Now you can make calls to the Facebook Marketing API
        (window as any).FB.api('/me/accounts', { access_token: accessToken }, (response: any) => {
          // Handle the response, e.g., connect the page to your app
        });
      } else {
        // User cancelled login or did not fully authorize.
      }
    }, { scope: 'pages_manage_ads,pages_read_engagement' });
  };

  return (
    <Stack spacing={2} direction="row" sx={sx}>
      <Button
        variant="contained"
        startIcon={<FacebookIcon />}
        onClick={handleFacebookLogin}
        sx={{
          backgroundColor: '#1877F2',
          '&:hover': {
            backgroundColor: '#145BC0',
          },
        }}
      >
        Connect a Facebook Page
      </Button>
    </Stack>
  );
}
