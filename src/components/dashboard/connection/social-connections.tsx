'use client';

import React, { useEffect, useState } from 'react';
import { Close as CloseIcon, Facebook as FacebookIcon } from '@mui/icons-material';
import { Button, Card, Grid, IconButton, Stack, Typography } from '@mui/material';
import type { SxProps } from '@mui/system';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

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
  const [adAccounts, setAdAccounts] = useState<{ id: string; name: string; currency: string }[]>([]);
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState<{ id: string; name: string; currency: string } | null>(null);
  const [selectedPage, setSelectedPage] = useState<{ id: string; name: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Track whether the component is mounted

  useEffect(() => {
    setIsMounted(true); // Mark the component as mounted
    const initializeState = () => {
      const token = getItemWithExpiry('fbAccessToken');
      const storedUserId = getItemWithExpiry('fbUserId');
      const storedAdAccount = getItemWithExpiry('fbAdAccountObj'); // This will store the object { id, name, currency }
      const storedPage = getItemWithExpiry('fbPage'); // This should be an object { id, name }
      console.log('Initialize state:', { token, storedUserId, storedAdAccount, storedPage });

      if (typeof token === 'string' && typeof storedUserId === 'string') {
        setAccessToken(token);
        setUserId(storedUserId);
        fetchAdAccounts(storedUserId, token);
        fetchPages(storedUserId, token);
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
      const apiPath = `/me/adaccounts?fields=id,name,currency`; // Fetch currency as well
      (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
        if (response && !response.error) {
          const accounts = response.data.map((account: any) => ({
            id: account.id,
            name: account.name,
            currency: account.currency, // Capture currency here
          }));
          console.log('Fetched ad accounts with currency:', accounts);
          setAdAccounts(accounts);

          // Now you can store the fetched data in the database
          accounts.forEach(async (account: { id: string; name: string; currency: string }) => {
            await storeAdAccountInDatabase(account);
          });
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

  const storeAdAccountInDatabase = async (account: { id: string; name: string; currency: string }) => {
    const supabase = createClient();
    const localUserId = localStorage.getItem('userid');

    // Check if the ad account already exists in the database for this user
    const { data: existingData, error: selectError } = await supabase
      .from('facebookData')
      .select('*')
      .eq('user_id', localUserId)
      .eq('account_id', account.id);

    if (selectError) {
      console.error('Error checking for existing ad account data:', selectError);
      return;
    }

    // If the ad account doesn't exist, insert it with the currency field
    if (existingData.length === 0) {
      const { data, error } = await supabase.from('facebookData').insert({
        account_id: account.id,
        account_name: account.name,
        currency: account.currency, // Store currency here
        user_id: localUserId,
      });

      if (error) {
        console.error('Error inserting ad account data with currency:', error);
      } else {
        console.log('Ad account data with currency inserted successfully:', data);
      }
    } else {
      console.log('Ad account already exists, skipping insertion.');
    }
  };

  const renderAdAccounts = () => {
    return adAccounts.map((account) => (
      <div key={account.id}>
        <p>Ad Account: {account.name}</p>
        <p>Currency: {account.currency}</p>
      </div>
    ));
  };

  return (
    <Stack className={styles.container}>
      <Typography variant="h5" gutterBottom>
        Connect with your social media accounts
      </Typography>
      <Typography variant="body2" gutterBottom>
        Simplify your ad strategy by connecting your accounts effortlessly.
      </Typography>

      <Grid container spacing={3}>
        {/* Facebook Card */}
        <Grid item xs={12} sm={4}>
          <Card className={styles.card} sx={{ backgroundColor: '#f0f4f8' }}>
            <FacebookIcon className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <Typography className={styles.title}>Facebook</Typography>
              <Typography className={styles.description}>
                Connect to Supercharge Your Ads!
              </Typography>
            </div>
            <Button
              className={styles.button}
              sx={{ backgroundColor: accessToken ? '#00c293' : '#f0f4f8', color: accessToken ? 'white' : 'black' }}
              onClick={() => {
                if (!accessToken) {
                  if ((window as any).FB) {
                    (window as any).FB.login((response: any) => {
                      if (response.authResponse) {
                        const token = response.authResponse.accessToken;
                        const userId = response.authResponse.userID;
                        setAccessToken(token);
                        setUserId(userId);

                        setItemWithExpiry('fbAccessToken', token, 24 * 60 * 60 * 1000); // 1 day expiry
                        setItemWithExpiry('fbUserId', userId, 24 * 60 * 60 * 1000);
                      }
                    }, { scope: 'ads_read, pages_show_list' });
                  }
                }
              }}
            >
              {accessToken ? 'CONNECTED' : 'CONNECT'}
            </Button>
          </Card>
        </Grid>

        {/* Instagram Card */}
        <Grid item xs={12} sm={4}>
          <Card className={styles.card} sx={{ backgroundColor: '#f0f4f8' }}>
            <InstagramIcon className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <Typography className={styles.title}>Instagram</Typography>
              <Typography className={styles.description}>
                Connect to Supercharge Your Ads!
              </Typography>
            </div>
            <Button className={styles.button} sx={{ backgroundColor: '#00c293', color: 'white' }}>
              COMING SOON
            </Button>
          </Card>
        </Grid>

        {/* LinkedIn Card */}
        <Grid item xs={12} sm={4}>
          <Card className={styles.card} sx={{ backgroundColor: '#f0f4f8' }}>
            <LinkedInIcon className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <Typography className={styles.title}>LinkedIn</Typography>
              <Typography className={styles.description}>
                We need to connect to your account
              </Typography>
            </div>
            <Button className={styles.button} sx={{ backgroundColor: '#00c293', color: 'white' }}>
              COMING SOON
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Render fetched ad accounts with currency */}
      <Typography variant="h6" sx={{ marginTop: '20px' }}>
        Connected Ad Accounts:
      </Typography>
      {renderAdAccounts()}

      <Typography variant="body2" sx={{ marginTop: '35px' }}>
        Your connected social accounts (0):
      </Typography>

      {/* New Feature Announcement */}
      <Typography variant="body2" style={{ marginTop: '280px', marginBottom: '32px' }}>
        New Feature Around the Corner! Google Ads coming soon - Stay Tuned for More Power.
      </Typography>
    </Stack>
  );
}
