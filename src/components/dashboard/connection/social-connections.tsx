'use client';

import React, { useEffect, useState } from 'react';
import { Button, Stack, Card, Typography, IconButton } from '@mui/material';
import { Facebook as FacebookIcon, Close as CloseIcon } from '@mui/icons-material';
import type { SxProps } from '@mui/system';
import AdAccountSelectionModal from './AdAccountSelectionModal';

const setItemWithExpiry = (key: string, value: any, ttl: number) => {
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
    const initializeState = () => {
      const token = getItemWithExpiry('fbAccessToken');
      const storedUserId = getItemWithExpiry('fbUserId');
      const storedAdAccount = getItemWithExpiry('fbAdAccount');
      if (token && storedUserId) {
        setAccessToken(token);
        setUserId(storedUserId);
        fetchAdAccounts(token);
        if (storedAdAccount) {
          fetchAdAccountBudget(token, JSON.parse(storedAdAccount).id);
        }
      }
      if (storedAdAccount) {
        setSelectedAdAccount(JSON.parse(storedAdAccount));
      }
    };

    loadFacebookSDK().then(() => {
      setIsSdkLoaded(true);
      initializeState();
    });

    initializeState();
  }, []);

  const fetchAdAccounts = (token: string) => {
    if ((window as any).FB) {
      (window as any).FB.api('/me/adaccounts', { access_token: token }, (response: any) => {
        if (response && !response.error) {
          setAdAccounts(response.data.map((account: any) => ({ id: account.id, name: account.name })));
        }
      });
    }
  };

  const fetchAdAccountBudget = (token: string, accountId: string) => {
    if ((window as any).FB) {
      (window as any).FB.api(
        `/${accountId}/insights`,
        { access_token: token, fields: 'spend,account_currency' },
        (response: any) => {
          if (response && !response.error) {
            const totalSpend = response.data.reduce((acc: number, item: any) => acc + parseFloat(item.spend), 0);
            const currency = response.data[0].account_currency;
            setItemWithExpiry('fbAdAccountBudget', JSON.stringify({ totalSpend, currency }), 30 * 60 * 1000);
          }
        }
      );
    }
  };

  const handleFacebookLogin = () => {
    if (!isSdkLoaded) return;
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        const userId = response.authResponse.userID;
        setAccessToken(accessToken);
        setUserId(userId);
        setItemWithExpiry('fbAccessToken', accessToken, 30 * 60 * 1000);
        setItemWithExpiry('fbUserId', userId, 30 * 60 * 1000);
        fetchAdAccounts(accessToken);
        setModalOpen(true);
      }
    }, { scope: 'ads_management,pages_manage_ads,pages_read_engagement' });
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAdAccountSelect = (accountId: string) => {
    const selectedAccount = adAccounts.find(account => account.id === accountId) || null;
    setSelectedAdAccount(selectedAccount);
    setItemWithExpiry('fbAdAccount', JSON.stringify(selectedAccount), 30 * 60 * 1000);
    setModalOpen(false);
    if (selectedAccount && accessToken) {
      fetchAdAccountBudget(accessToken, selectedAccount.id);
    }
  };

  const handleRemoveSelection = () => {
    setSelectedAdAccount(null);
    localStorage.removeItem('fbAdAccount');
  };

  return (
    <Stack spacing={2} direction="column" sx={sx}>
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
