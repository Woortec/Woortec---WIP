'use client';

import React, { useEffect, useState } from 'react';
import { Button, Stack, Card, Typography, IconButton } from '@mui/material';
import { Facebook as FacebookIcon, Close as CloseIcon } from '@mui/icons-material';
import type { SxProps } from '@mui/system';
import AdAccountSelectionModal from './AdAccountSelectionModal';
import PageSelectionModal from './PageSelectionModal';
import styles from './styles/Connect.module.css';

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
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState<{ id: string; name: string } | null>(null);
  const [selectedPage, setSelectedPage] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const initializeState = () => {
      const token = getItemWithExpiry('fbAccessToken');
      const storedUserId = getItemWithExpiry('fbUserId');
      const storedAdAccount = getItemWithExpiry('fbAdAccount'); // This should be an object { id, name }
      const storedPage = getItemWithExpiry('fbPage'); // This should be an object { id, name }
      console.log('Initialize state:', { token, storedUserId, storedAdAccount, storedPage });
      if (token && storedUserId) {
        setAccessToken(token);
        setUserId(storedUserId);
        fetchAdAccounts(token);
        fetchPages(token);
      }
      if (storedAdAccount) {
        setSelectedAdAccount(storedAdAccount); // Directly use the stored object
      }
      if (storedPage) {
        setSelectedPage(storedPage); // Directly use the stored object
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
          const accounts = response.data.map((account: any) => ({ id: account.id, name: account.name }));
          console.log('Fetched ad accounts:', accounts);
          setAdAccounts(accounts);
        } else {
          console.error('Error fetching ad accounts:', response.error);
        }
      });
    }
  };

  const fetchPages = (token: string) => {
    if ((window as any).FB) {
      (window as any).FB.api('/me/accounts', { access_token: token }, (response: any) => {
        if (response && !response.error) {
          const pages = response.data.map((page: any) => ({ id: page.id, name: page.name }));
          console.log('Fetched pages:', pages);
          setPages(pages);
        } else {
          console.error('Error fetching pages:', response.error);
        }
      });
    }
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
        setItemWithExpiry('fbAccessToken', accessToken, 30 * 60 * 1000);
        setItemWithExpiry('fbUserId', userId, 30 * 60 * 1000);
        fetchAdAccounts(accessToken);
        fetchPages(accessToken);
        setModalOpen(true);
      } else {
        console.error('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'ads_management,ads_read,business_management,pages_manage_ads,pages_read_engagement,pages_show_list,read_insights' });
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAdAccountSelect = (accountId: string) => {
    const selectedAccount = adAccounts.find(account => account.id === accountId) || null;
    console.log('Ad account selected:', selectedAccount);
    setSelectedAdAccount(selectedAccount);
    if (selectedAccount) {
      setItemWithExpiry('fbAdAccount', selectedAccount, 30 * 60 * 1000); // Store both id and name
    }
    setModalOpen(false);
  };

  const handlePageSelect = (pageId: string) => {
    const selectedPage = pages.find(page => page.id === pageId) || null;
    console.log('Page selected:', selectedPage);
    setSelectedPage(selectedPage);
    if (selectedPage) {
      setItemWithExpiry('fbPage', selectedPage, 30 * 60 * 1000); // Store both id and name
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

  return (
    <Stack spacing={2} direction="row" className={styles.container} sx={sx}>
      {selectedAdAccount ? (
        <Card className={styles.card}>
          <FacebookIcon className={styles.cardIcon} />
          <div className={styles.cardContent}>
            <Typography variant="body1">
              {selectedAdAccount.name}
            </Typography>
          </div>
          <IconButton onClick={handleRemoveSelection} className={styles.removeButton}>
            <CloseIcon />
          </IconButton>
        </Card>
      ) : (
        <Button
          variant="contained"
          startIcon={<FacebookIcon />}
          onClick={handleFacebookLogin}
          className={styles.button}
        >
          Connect a Facebook Page
        </Button>
      )}
      {selectedPage ? (
        <Card className={styles.card}>
          <div className={styles.cardContent}>
            <Typography variant="body1">
              {selectedPage.name}
            </Typography>
          </div>
          <IconButton onClick={() => setSelectedPage(null)} className={styles.removeButton}>
            <CloseIcon />
          </IconButton>
        </Card>
      ) : (
        <Button
          variant="contained"
          onClick={() => setPageModalOpen(true)}
          className={styles.button}
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
        onClose={() => setPageModalOpen(false)}
        onSelect={handlePageSelect}
      />
    </Stack>
  );
}
