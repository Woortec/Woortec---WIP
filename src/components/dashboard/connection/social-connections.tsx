'use client';

import React, { useEffect, useState } from 'react';
import { Close as CloseIcon, Facebook as FacebookIcon } from '@mui/icons-material';
import { Button, Card, IconButton, Stack, Typography } from '@mui/material';
import type { SxProps } from '@mui/system';

import { createClient } from '../../../../utils/supabase/client';
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
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: '961870345497057',
        cookie: true,
        xfbml: true,
        version: 'v19.0',
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
    const supabase = createClient();
    const uuid = localStorage.getItem('userid');
    const hehe = async () => {
      const { data, error } = await supabase
        .from('facebookData')
        .select('*') // Specify the columns you want to fetch, or '*' for all columns
        .eq('user_id', uuid);
      console.log('thisishioh isod', data);
      if (data) {
        setAccessToken(data[0].access_token);
        setUserId(data[0].fb_user_id);
        setAdAccounts([
          {
            name: data[0].ad_account_name,
            id: data[0].account_id,
          },
        ]);
        setSelectedPage({
          id: data[0].page_id,
          name: data[0].page_name,
        });
      }
    };
    hehe();
  }, []);

  useEffect(() => {
    const initializeState = () => {
      const token = getItemWithExpiry('fbAccessToken');
      const storedUserId = getItemWithExpiry('fbUserId');
      const storedAdAccountId = getItemWithExpiry('fbAdAccount');
      const storedAdAccount = getItemWithExpiry('fbAdAccountObj'); // This will store the object { id, name }
      const storedPage = getItemWithExpiry('fbPage'); // This should be an object { id, name }
      console.log('Initialize state:', { token, storedUserId, storedAdAccount, storedPage });

      if (typeof token === 'string' && typeof storedUserId === 'string') {
        setAccessToken(token);
        setUserId(storedUserId);
        fetchAdAccounts(storedUserId, token);
        fetchPages(storedUserId, token); // Pass the token and userId after ensuring they are strings
      }

      if (storedAdAccountId) {
        setSelectedAdAccount(storedAdAccount || { id: storedAdAccountId, name: '' });
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

  const fetchAdAccounts = (userId: string, token: string) => {
    if ((window as any).FB) {
      const apiPath = `/me/adaccounts?fields=id,name`;
      (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
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

  const fetchPages = (userId: string, token: string) => {
    if ((window as any).FB) {
      console.log('Fetching pages for userId:', userId, 'with token:', token);

      const apiPath = `/me/accounts`;

      (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
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
    (window as any).FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          const userId = response.authResponse.userID;
          console.log('Facebook login successful:', { accessToken, userId });
          setAccessToken(accessToken);
          setUserId(userId);
          setItemWithExpiry('fbAccessToken', accessToken, 30 * 60 * 1000);
          setItemWithExpiry('fbUserId', userId, 30 * 60 * 1000);
          fetchAdAccounts(userId, accessToken);
          fetchPages(userId, accessToken);
          setModalOpen(true);
        } else {
          console.error('User cancelled login or did not fully authorize.');
        }
      },
      {
        scope:
          'ads_management,ads_read,business_management,pages_manage_ads,pages_read_engagement,pages_show_list,read_insights',
      }
    );
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAdAccountSelect = (accountId: string) => {
    const selectedAccount = adAccounts.find((account) => account.id === accountId) || null;
    console.log('Ad account selected:', selectedAccount);
    setSelectedAdAccount(selectedAccount);
    if (selectedAccount) {
      setItemWithExpiry('fbAdAccount', selectedAccount.id, 30 * 60 * 1000); // Store only the id
      setItemWithExpiry('fbAdAccountObj', selectedAccount, 30 * 60 * 1000); // Store the full object with id and name
      const uuid = localStorage.getItem('userId');
    }
    setModalOpen(false);
  };

  const handlePageSelect = (pageId: string) => {
    const selectedPage = pages.find((page) => page.id === pageId) || null;
    console.log('Page selected:', selectedPage);
    setSelectedPage(selectedPage);
    if (selectedPage) {
      setItemWithExpiry('fbPage', selectedPage, 30 * 60 * 1000); // Store both id and name
    }
    setPageModalOpen(false);
  };

  const handleRemoveSelection = async () => {
    const supabase = createClient();

    console.log('Removing selection');
    setSelectedAdAccount(null);
    setSelectedPage(null);
    localStorage.removeItem('fbAdAccount');
    localStorage.removeItem('fbAdAccountObj');
    localStorage.removeItem('fbAccessToken');
    localStorage.removeItem('fbUserId');
    localStorage.removeItem('fbPage');
    setAccessToken(null);
    setUserId(null);
    setAdAccounts([]);
    setPages([]);
    const userId = localStorage.getItem('userid');
    if (!userId) {
      console.warn('No user ID found in localStorage. Skipping deletion.');
      return;
    }
    const { data, error } = await supabase.from('facebookData').delete().eq('user_id', userId);

    if (error) {
      console.error('Error deleting row from facebookData:', error);
    } else {
      console.log('Successfully deleted row from facebookData:', data);
    }
  };

  useEffect(() => {
    if (accessToken && userId && adAccounts && selectedAdAccount && selectedPage) {
      const supabase = createClient();

      const inserData = async () => {
        console.log(
          'accessToken',
          accessToken,
          'userId',
          userId,
          'selectedAdAccount',
          selectedAdAccount,
          'selectedPage',
          selectedPage
        );

        const localUserId = localStorage.getItem('userid');

        // First, check if a row with the user_id already exists
        const { data: existingData, error: selectError } = await supabase
          .from('facebookData')
          .select('*')
          .eq('user_id', localUserId);

        if (selectError) {
          console.error('Error checking for existing data:', selectError);
          return;
        }

        // If no existing data is found, proceed to insert
        if (existingData.length === 0) {
          const { data, error } = await supabase.from('facebookData').insert({
            account_id: selectedAdAccount.id,
            access_token: accessToken,
            fb_user_id: userId,
            user_id: localUserId,
            page_id: selectedPage.id,
            account_name: selectedAdAccount.name,
            page_name: selectedPage.name,
          });

          if (error) {
            console.error('Error inserting data:', error);
          } else {
            console.log('Data inserted successfully:', data);
          }
        } else {
          console.log('Data already exists for this user_id, skipping insertion.');
        }
      };

      inserData();
    }
  }, [accessToken, userId, adAccounts, selectedAdAccount, selectedPage]);

  return (
    <Stack spacing={2} direction="row" className={styles.container} sx={sx}>
      {selectedAdAccount ? (
        <Card className={styles.card}>
          <FacebookIcon className={styles.cardIcon} />
          <div className={styles.cardContent}>
            <Typography variant="body1">{selectedAdAccount.name}</Typography>
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
            <Typography variant="body1">{selectedPage.name}</Typography>
          </div>
          <IconButton onClick={() => setSelectedPage(null)} className={styles.removeButton}>
            <CloseIcon />
          </IconButton>
        </Card>
      ) : (
        <Button variant="contained" onClick={() => setPageModalOpen(true)} className={styles.button}>
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
