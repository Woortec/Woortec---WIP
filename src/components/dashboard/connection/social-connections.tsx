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

const loadFacebookSDK = () => {
  return new Promise<void>((resolve) => {
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: '843123844562723',
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

    // Check Supabase if user is already connected
    const { data, error } = await supabase
      .from('facebookData')
      .select('*')
      .eq('user_id', localUserId);

    if (error) {
      console.error('Error checking user connection:', error);
      return;
    }

    if (data && data.length > 0) {
      // User is already connected, set state accordingly
      setAccessToken(data[0].access_token);
      setUserId(data[0].fb_user_id);
      setSelectedAdAccount({
        id: data[0].account_id,
        name: data[0].account_name,
        currency: data[0].currency,
      });
      setSelectedPage({
        id: data[0].page_id,
        name: data[0].page_name,
      });
      setIsConnected(true);
    }
  };

  const handleFacebookLogin = () => {
    if (!isSdkLoaded) {
      console.error('Facebook SDK not loaded yet.');
      return;
    }

    if ((window as any).FB) {
      (window as any).FB.login(
        (response: any) => {
          if (response.authResponse) {
            const token = response.authResponse.accessToken;
            const userId = response.authResponse.userID;
            console.log('Facebook login successful. Token:', token, 'UserId:', userId);
            setAccessToken(token);
            setUserId(userId);

            // Store accessToken and userId without expiry
            localStorage.setItem('fbAccessToken', token);
            localStorage.setItem('fbUserId', userId);

            // Open the ad account selection modal after successful login
            fetchAdAccounts(userId, token);
            setModalOpen(true);
          } else {
            console.log('User canceled login or did not fully authorize.');
          }
        },
        { scope: 'ads_read, pages_show_list, business_management' }
      );
    }
  };

  const fetchAdAccounts = (userId: string, token: string) => {
    if (!isSdkLoaded) {
      console.error('Facebook SDK not loaded yet. Cannot fetch ad accounts.');
      return;
    }
    if ((window as any).FB) {
      const apiPath = `/me/adaccounts?fields=id,name,currency`;
      console.log('Fetching ad accounts with token:', token);
      (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
        if (response && !response.error) {
          console.log('Ad accounts fetched:', response);
          const accounts = response.data.map((account: any) => ({
            id: account.id,
            name: account.name,
            currency: account.currency,
          }));
          setAdAccounts(accounts);
        } else {
          console.error('Error fetching ad accounts:', response.error);
        }
      });
    }
  };

  const fetchPages = (userId: string, token: string) => {
    if (!isSdkLoaded) {
      console.error('Facebook SDK not loaded yet. Cannot fetch pages.');
      return;
    }
    if ((window as any).FB) {
      const apiPath = `/me/accounts`;
      console.log('Fetching pages with token:', token);
      (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
        if (response && !response.error) {
          console.log('Pages fetched:', response);
          const pages = response.data.map((page: any) => ({ id: page.id, name: page.name }));
          setPages(pages);
        } else {
          console.error('Error fetching pages:', response.error);
        }
      });
    }
  };

  const handleAdAccountSelect = (accountId: string) => {
    console.log('Ad account selected:', accountId);
    const selectedAccount = adAccounts.find((account) => account.id === accountId);
    if (selectedAccount) {
      setSelectedAdAccount(selectedAccount);

      // Store in localStorage without expiry
      localStorage.setItem('fbAdAccountObj', JSON.stringify(selectedAccount));

      // Close the ad account modal
      setModalOpen(false);

      // Fetch pages once ad account is selected
      if (userId && accessToken) {
        fetchPages(userId, accessToken);
        setPageModalOpen(true);
      } else {
        console.error('UserId or AccessToken missing. Cannot fetch pages.');
      }
    }
  };

  const handlePageSelect = (pageId: string) => {
    console.log('Page selected:', pageId);
    const selectedPage = pages.find((page) => page.id === pageId);
    if (selectedPage) {
      setSelectedPage(selectedPage);

      // Store in localStorage without expiry
      localStorage.setItem('fbPage', JSON.stringify(selectedPage));

      // Close the page modal
      setPageModalOpen(false);

      // Store both the ad account and page data into Supabase after both selections are made
      if (selectedAdAccount && selectedPage && accessToken && userId) {
        storeDataInSupabase({
          accessToken: accessToken,
          userId: userId,
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
    console.log('Storing data in Supabase...');
    const { data, error } = await supabase.from('facebookData').insert({
      user_id: localUserId,
      access_token: accessToken,
      fb_user_id: userId,
      page_id: selectedPage.id,
      page_name: selectedPage.name,
      account_id: selectedAdAccount.id,
      account_name: selectedAdAccount.name,
      currency: selectedAdAccount.currency,
    });

    if (error) {
      console.error('Error inserting data into Supabase:', error);
    } else {
      console.log('Data inserted into Supabase successfully:', data);
      setIsConnected(true);
    }
  };

  const handleDisconnectAdAccount = async () => {
    console.log('Disconnecting Ad Account...');
    setSelectedAdAccount(null);
    localStorage.removeItem('fbAdAccountObj');
    localStorage.removeItem('fbAccessToken');
    localStorage.removeItem('fbUserId');
    setAccessToken(null);
    setUserId(null);
    setIsConnected(false);

    // Optionally delete the data from Supabase
    const localUserId = localStorage.getItem('userid');
    const { error } = await supabase.from('facebookData').delete().eq('user_id', localUserId);
    if (error) {
      console.error('Error deleting data from Supabase:', error);
    } else {
      console.log('User data deleted from Supabase.');
    }
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

      <Typography variant="body2" sx={{ marginTop: '35px' }}>
        Your connected social accounts (0):
      </Typography>

      {/* New Feature Announcement */}
      <Typography variant="body2" style={{ marginTop: '280px', marginBottom: '32px' }}>
        New Feature Around the Corner! Google Ads coming soon - Stay Tuned for More Power.
      </Typography>

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
