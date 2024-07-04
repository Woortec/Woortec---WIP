'use client';

import React, { useEffect, useState } from 'react';
import { Button, Stack, Card, CardContent, Typography, IconButton } from '@mui/material';
import { Facebook as FacebookIcon, Close as CloseIcon } from '@mui/icons-material';
import type { SxProps } from '@mui/system';
import AdAccountSelectionModal from './AdAccountSelectionModal'; // Import the modal component

const setItemWithExpiry = (key: string, value: string, ttl: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getItemWithExpiry = (key: string) => {
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<{ id: string; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadFacebookSDK().then(() => {
      setIsSdkLoaded(true);
      const token = getItemWithExpiry('fbAccessToken');
      const storedUserId = getItemWithExpiry('fbUserId');
      if (token && storedUserId) {
        setAccessToken(token);
        setUserId(storedUserId);
        fetchAdAccounts(token);
      }
    });
  }, []);

  const fetchAdAccounts = (token: string) => {
    (window as any).FB.api('/me/adaccounts', { access_token: token }, (response: any) => {
      if (response && !response.error) {
        setAdAccounts(response.data.map((account: any) => ({ id: account.id, name: account.name })));
      }
    });
  };

  const handleFacebookLogin = () => {
    if (!isSdkLoaded) return;
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        const userId = response.authResponse.userID;
        setAccessToken(accessToken);
        setUserId(userId);
        // Store the token and user ID with a 30-minute expiry
        setItemWithExpiry('fbAccessToken', accessToken, 30 * 60 * 1000);
        setItemWithExpiry('fbUserId', userId, 30 * 60 * 1000);
        // Fetch ad accounts
        fetchAdAccounts(accessToken);
        // Open modal
        setModalOpen(true);
      } else {
        // User cancelled login or did not fully authorize.
      }
    }, { scope: 'ads_management,pages_manage_ads,pages_read_engagement' });
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAdAccountSelect = (accountId: string) => {
    const selectedAccount = adAccounts.find(account => account.id === accountId) || null;
    setSelectedAdAccount(selectedAccount);
    setModalOpen(false);
  };

  const handleRemoveSelection = () => {
    setSelectedAdAccount(null);
  };

  return (
    <Stack spacing={2} direction="row" sx={sx}>
      {selectedAdAccount ? (
        <Card sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
          <FacebookIcon sx={{ marginRight: 1 }} />
          <Typography variant="body1">
            {selectedAdAccount.name} <br /> {selectedAdAccount.id}
          </Typography>
          <IconButton onClick={handleRemoveSelection} sx={{ marginLeft: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </Card>
      ) : (
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
      )}
      <AdAccountSelectionModal
        open={modalOpen}
        adAccounts={adAccounts}
        onClose={handleModalClose}
        onSelect={handleAdAccountSelect}
      />
    </Stack>
  );
}
