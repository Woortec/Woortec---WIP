'use client';

import React, { useEffect, useState } from 'react';
import { Button, Stack, Card, Typography, IconButton } from '@mui/material';
import { Facebook as FacebookIcon, Close as CloseIcon } from '@mui/icons-material';
import type { SxProps } from '@mui/system';
import AdAccountSelectionModal from './AdAccountSelectionModal'; // Import the modal component
import PageSelectionModal from './PageSelectionModal'; // Import the page selection modal component

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
        version: 'v20.0'
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
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState<{ id: string; name: string } | null>(null);
  const [selectedPage, setSelectedPage] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadFacebookSDK().then(() => {
      setIsSdkLoaded(true);
      const token = getItemWithExpiry('fbAccessToken');
      const storedUserId = getItemWithExpiry('fbUserId');
      const storedAdAccount = getItemWithExpiry('fbAdAccount');
      const storedPage = getItemWithExpiry('fbPage');
      console.log('Initialize state:', { token, storedUserId, storedAdAccount, storedPage });
      if (token && storedUserId) {
        setAccessToken(token);
        setUserId(storedUserId);
        if (storedAdAccount) {
          setSelectedAdAccount({ id: storedAdAccount, name: '' });
        }
        if (storedPage) {
          setSelectedPage({ id: storedPage, name: '' });
        }
      }
    });
  }, []);

  const fetchAdAccounts = (token: string) => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).FB) {
        (window as any).FB.api('/me/adaccounts', { access_token: token }, (response: any) => {
          if (response && !response.error) {
            const accounts = response.data.map((account: any) => ({ id: account.id, name: account.name }));
            console.log('Fetched ad accounts:', accounts);
            setAdAccounts(accounts);
            resolve();
          } else {
            console.error('Error fetching ad accounts:', response.error);
            reject(response.error);
          }
        });
      }
    });
  };

  const fetchPages = (token: string) => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).FB) {
        (window as any).FB.api('/me/accounts', { access_token: token }, (response: any) => {
          if (response && !response.error) {
            const pages = response.data.map((page: any) => ({ id: page.id, name: page.name }));
            console.log('Fetched pages:', pages);
            setPages(pages);
            resolve();
          } else {
            console.error('Error fetching pages:', response.error);
            reject(response.error);
          }
        });
      }
    });
  };

  const handleFacebookLogin = () => {
    if (!isSdkLoaded) return;
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        const userId = response.authResponse.userID;
        console.log('Facebook login successful:', { accessToken, userId });
        setAccessToken(accessToken);
        setUserId(userId);
        // Store the token and user ID with a 30-minute expiry
        setItemWithExpiry('fbAccessToken', accessToken, 30 * 60 * 1000);
        setItemWithExpiry('fbUserId', userId, 30 * 60 * 1000);

        // Fetch ad accounts and pages
        fetchAdAccounts(accessToken).then(() => {
          fetchPages(accessToken).then(() => {
            setModalOpen(true);
          });
        });
      } else {
        console.error('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'ads_management,ads_read,business_management,pages_manage_ads,pages_read_engagement,pages_show_list,read_insights,email' });
  };

  const handleAdAccountSelect = (accountId: string) => {
    const selectedAccount = adAccounts.find(account => account.id === accountId) || null;
    console.log('Ad account selected:', selectedAccount);
    setSelectedAdAccount(selectedAccount);
    if (selectedAccount) {
      setItemWithExpiry('fbAdAccount', selectedAccount.id, 30 * 60 * 1000);
    }
    setModalOpen(false);
  };

  const handlePageSelect = (pageId: string) => {
    const selectedPage = pages.find(page => page.id === pageId) || null;
    console.log('Page selected:', selectedPage);
    setSelectedPage(selectedPage);
    if (selectedPage) {
      setItemWithExpiry('fbPage', selectedPage.id, 30 * 60 * 1000);
    }
    setPageModalOpen(false);
  };

  const handleRemoveSelection = () => {
    console.log('Removing selection');
    setSelectedAdAccount(null);
    setSelectedPage(null);
    localStorage.removeItem('fbAdAccount');
    localStorage.removeItem('fbAccessToken');
    localStorage.removeItem('fbUserId');
    localStorage.removeItem('fbPage');
    setAccessToken(null);
    setUserId(null);
    setAdAccounts([]);
    setPages([]);
  };

  function handleModalClose(): void {
    setModalOpen(false);
  }

  function handlePageModalClose(): void {
    setPageModalOpen(false);
  }

  return (
    <Stack spacing={2} direction="row" sx={{ ...sx, flexWrap: 'wrap' }}>
      {selectedAdAccount ? (
        <Card sx={{ display: 'flex', alignItems: 'center', padding: 1, flex: '1 1 auto' }}>
          <FacebookIcon sx={{ marginRight: 1 }} />
          <Typography variant="body1" sx={{ flex: '1 1 auto' }}>
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
            flex: '1 1 auto'
          }}
        >
          Connect a Facebook Page
        </Button>
      )}
      {selectedPage ? (
        <Card sx={{ display: 'flex', alignItems: 'center', padding: 1, flex: '1 1 auto' }}>
          <Typography variant="body1" sx={{ flex: '1 1 auto' }}>
            {selectedPage.name} <br /> {selectedPage.id}
          </Typography>
          <IconButton onClick={() => setSelectedPage(null)} sx={{ marginLeft: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </Card>
      ) : (
        <Button
          variant="contained"
          onClick={() => {
            fetchPages(accessToken || '');
            setPageModalOpen(true);
          }}
          sx={{
            backgroundColor: '#1877F2',
            '&:hover': {
              backgroundColor: '#145BC0',
            },
            flex: '1 1 auto'
          }}
        >
          Select a Page
        </Button>
      )}
      <AdAccountSelectionModal
        open={modalOpen}
        adAccounts={adAccounts}
        onClose={handleModalClose}
        onSelect={handleAdAccountSelect}
      />
      <PageSelectionModal
        open={pageModalOpen}
        pages={pages}
        onClose={handlePageModalClose}
        onSelect={handlePageSelect}
      />
    </Stack>
  );
}
