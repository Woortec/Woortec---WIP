'use client';

import React, { useEffect, useState } from 'react';
import { Facebook as FacebookIcon } from '@mui/icons-material';
import { Button, Card, Grid, Stack, Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { SxProps } from '@mui/system';
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

const refreshLongLivedToken = async (token: string) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=843123844562723&client_secret=YOUR_APP_SECRET&fb_exchange_token=${token}`
    );
    const data = await response.json();

    if (data.access_token) {
      const newExpiry = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
      setItemWithExpiry('fbAccessToken', data.access_token, newExpiry);
      return data.access_token;
    }
    throw new Error('Failed to refresh long-lived token');
  } catch (error) {
    console.error('Error refreshing long-lived token:', error);
    return null;
  }
};

const fetchPages = (userId: string, token: string, setPages: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>) => {
  if ((window as any).FB) {
    const apiPath = `/me/accounts`;
    (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
      if (response && !response.error) {
        const pages = response.data.map((page: any) => ({ id: page.id, name: page.name }));
        setPages(pages);
      } else {
        console.error('Error fetching pages:', response.error);
      }
    });
  }
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
  const [isConnected, setIsConnected] = useState(false); // Track if the user is already connected

  const supabase = createClient();

  // Initialize Facebook SDK and state
  useEffect(() => {
    loadFacebookSDK().then(() => {
      setIsSdkLoaded(true);
    });

    checkUserConnection(); // Check if the user is already connected on page load
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
      const now = new Date().getTime();

      if (now > new Date(expires_at).getTime()) {
        const refreshedToken = await refreshLongLivedToken(access_token);
        if (refreshedToken) {
          setAccessToken(refreshedToken);
        }
      } else {
        setAccessToken(access_token);
      }

      setUserId(data[0].fb_user_id);
      setIsConnected(true);
    }
  };

  const handleFacebookLogin = () => {
    if ((window as any).FB) {
      (window as any).FB.login(
        async (response: any) => {
          if (response.authResponse) {
            const token = response.authResponse.accessToken;
            const userId = response.authResponse.userID;

            const longLivedToken = await refreshLongLivedToken(token);
            if (longLivedToken) {
              setAccessToken(longLivedToken);
              setUserId(userId);

              // Store in Supabase
              const now = new Date();
              const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

              await supabase.from('facebookData').upsert({
                user_id: localStorage.getItem('userid'),
                access_token: longLivedToken,
                fb_user_id: userId,
                expires_at: expiresAt,
              });

              setIsConnected(true);
            }
          }
        },
        { scope: 'ads_read, pages_show_list' }
      );
    }
  };

  const handleAdAccountSelect = (accountId: string) => {
    const selectedAccount = adAccounts.find((account) => account.id === accountId);
    if (selectedAccount) {
      setSelectedAdAccount(selectedAccount);

      // Store in localStorage
      setItemWithExpiry('fbAdAccountObj', selectedAccount, 24 * 60 * 60 * 1000);

      // Close the ad account modal and open the page selection modal
      setModalOpen(false);
      fetchPages(userId!, accessToken!, setPages); // Fetch pages once ad account is selected
      setPageModalOpen(true);
    }
  };

  const handlePageSelect = (pageId: string) => {
    const selectedPage = pages.find((page) => page.id === pageId);
    if (selectedPage) {
      setSelectedPage(selectedPage);

      // Store in localStorage
      setItemWithExpiry('fbPage', selectedPage, 24 * 60 * 60 * 1000);

      // Close the page modal
      setPageModalOpen(false);

      // Store both the ad account and page data into Supabase after both selections are made
      if (selectedAdAccount && selectedPage) {
        storeDataInSupabase({
          accessToken: accessToken!,
          userId: userId!,
          selectedAdAccount: selectedAdAccount,
          selectedPage: selectedPage,
        });
      }
    }
  };

  const storeDataInSupabase = async ({
    accessToken,
    userId,
    selectedAdAccount,
    selectedPage,
  }: {
    accessToken: string;
    userId: string;
    selectedAdAccount: { id: string; name: string; currency: string };
    selectedPage: { id: string; name: string };
  }) => {
    const localUserId = localStorage.getItem('userid');

    const { data, error } = await supabase.from('facebookData').upsert({
      user_id: localUserId,
      access_token: accessToken,
      fb_user_id: userId,
      page_id: selectedPage.id,
      page_name: selectedPage.name,
      account_id: selectedAdAccount.id,
      account_name: selectedAdAccount.name,
      currency: selectedAdAccount.currency,
      expires_at: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      console.error('Error inserting data into Supabase:', error);
    } else {
      console.log('Data inserted into Supabase successfully:', data);
      setIsConnected(true);
    }
  };

  const handleDisconnectAdAccount = async () => {
    setSelectedAdAccount(null);
    localStorage.removeItem('fbAdAccountObj');
    localStorage.removeItem('fbAccessToken');
    localStorage.removeItem('fbUserId');
    setAccessToken(null);
    setUserId(null);
    setIsConnected(false);

    // Optionally delete the data from Supabase
    const localUserId = localStorage.getItem('userid');
    await supabase.from('facebookData').delete().eq('user_id', localUserId);
  };

  const renderAdAccounts = () => {
    if (!selectedAdAccount) return null;
    return (
      <div>
        <p>Ad Account: {selectedAdAccount.name}</p>
        <p>Currency: {selectedAdAccount.currency}</p>
      </div>
    );
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
                {isConnected ? 'Connected to Facebook' : 'Connect to Supercharge Your Ads!'}
              </Typography>
            </div>
            {isConnected ? (
              <Button
                className={styles.button}
                sx={{ backgroundColor: '#00c293', color: 'white' }}
                onClick={handleDisconnectAdAccount}
              >
                DISCONNECT
              </Button>
            ) : (
              <Button
                className={styles.button}
                sx={{ backgroundColor: '#f0f4f8', color: 'black' }}
                onClick={handleFacebookLogin}
              >
                CONNECT
              </Button>
            )}
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
        Connected Ad Account:
      </Typography>
      {renderAdAccounts()}

      {/* Modals for ad account and page selection */}
      <AdAccountSelectionModal
        open={modalOpen}
        adAccounts={adAccounts}
        onClose={() => setModalOpen(false)}
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