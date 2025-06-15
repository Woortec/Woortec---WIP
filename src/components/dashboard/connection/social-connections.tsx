'use client';

import React, { useEffect, useState } from 'react';
import { Facebook as FacebookIcon } from '@mui/icons-material';
import { Button, Card, Grid, Stack, Typography, Box } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { SxProps } from '@mui/system';
import { createClient } from '../../../../utils/supabase/client';
import AdAccountSelectionModal from './AdAccountSelectionModal';
import PageSelectionModal from './PageSelectionModal';
import styles from './styles/Connect.module.css';
import { useLocale } from '@/contexts/LocaleContext';

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
  const { t } = useLocale();

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
    if ((window as any).FB) {
      (window as any).FB.login(
        (response: any) => {
          if (response.authResponse) {
            const shortLivedToken = response.authResponse.accessToken;
            const userId = response.authResponse.userID;
  
            // Call a separate async function to handle token exchange
            exchangeLongLivedToken(shortLivedToken, userId);
          }
        },
        { scope: 'ads_read, pages_show_list' }
      );
    }
  };
  
  // Separate async function
  const exchangeLongLivedToken = async (shortLivedToken: string, userId: string) => {
    try {
      const exchangeResponse = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?  
         grant_type=fb_exchange_token&
         client_id=843123844562723&
         client_secret=5df1c6be88e88e4d9b9936bbaeaff10d&
         fb_exchange_token=${shortLivedToken}`
      );
  
      const tokenData = await exchangeResponse.json();
      const longLivedToken = tokenData.access_token;
  
      if (longLivedToken) {
        setAccessToken(longLivedToken);
        setUserId(userId);
  
        // Store in localStorage with expiry
        setItemWithExpiry('fbAccessToken', longLivedToken, 60 * 60 * 1000 * 60); // 60 days
        setItemWithExpiry('fbUserId', userId, 60 * 60 * 1000 * 60);
  
        // Fetch Ad Accounts
        fetchAdAccounts(userId, longLivedToken);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
    }
  };
  
  

  const fetchAdAccounts = (userId: string, token: string) => {
    if ((window as any).FB) {
      const apiPath = `/me/adaccounts?fields=id,name,currency`;
      (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
        if (response && !response.error) {
          const accounts = response.data.map((account: any) => ({
            id: account.id,
            name: account.name,
            currency: account.currency,
          }));
          setAdAccounts(accounts);
        }
      });
    }
  };

  const fetchPages = (userId: string, token: string) => {
    if ((window as any).FB) {
      const apiPath = `/me/accounts`;
      (window as any).FB.api(apiPath, { access_token: token }, (response: any) => {
        if (response && !response.error) {
          const pages = response.data.map((page: any) => ({ id: page.id, name: page.name }));
          setPages(pages);
        }
      });
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
      fetchPages(userId!, accessToken!); // Fetch pages once ad account is selected
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

  return (
    <Box className={styles.container}>
      <Typography variant="h5" gutterBottom>
        {t('SocialConnections.connectTitle')}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t('SocialConnections.connectSubtitle')}
      </Typography>

      <Grid container spacing={3}>
        {/* Facebook Card */}
        <Grid item xs={12} sm={4}>
          <Card className={styles.card} sx={{ backgroundColor: '#f0f4f8', position: 'relative' }}>
            <FacebookIcon className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <Typography className={styles.title}>Facebook</Typography>
              <Typography className={styles.description}>
                {isConnected ? t('SocialConnections.connectedFacebook') : t('SocialConnections.connectFacebook')}
              </Typography>
            </div>
            {isConnected ? (
              <Button
                className={styles.button}
                sx={{ backgroundColor: '#00c293', color: 'white' }}
                onClick={handleDisconnectAdAccount}
              >
                {t('SocialConnections.disconnect')}
              </Button>
            ) : (
              <Button
                className={styles.button}
                sx={{ backgroundColor: '#f0f4f8', color: 'black' }}
                onClick={handleFacebookLogin}
              >
                {t('SocialConnections.connect')}
              </Button>
            )}
            {/* Connected Facebook Account Details */}
            {isConnected && selectedAdAccount && selectedPage && (
              <Box sx={{ mt: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#1877f2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1,
                  }}>
                    <FacebookIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {t('SocialConnections.connectedFacebookAccount') || 'Connected Facebook Account'}
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {t('SocialConnections.adAccountId') || 'Ad Account ID'}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedAdAccount.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {t('SocialConnections.adAccountName') || 'Ad Account Name'}
                    </Typography>
                    <Typography variant="body2">
                      {selectedAdAccount.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {t('SocialConnections.currency') || 'Currency'}
                    </Typography>
                    <Typography variant="body2">
                      {selectedAdAccount.currency}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {t('SocialConnections.connectedPage') || 'Connected Page'}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedPage.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {t('SocialConnections.pageId') || 'Page ID'}
                    </Typography>
                    <Typography variant="body2">
                      {selectedPage.id}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
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
                {t('SocialConnections.connectInstagram')}
              </Typography>
            </div>
            <Button className={styles.button} sx={{ backgroundColor: '#00c293', color: 'white' }}>
              {t('SocialConnections.comingSoon')}
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
                {t('SocialConnections.connectLinkedIn')}
              </Typography>
            </div>
            <Button className={styles.button} sx={{ backgroundColor: '#00c293', color: 'white' }}>
              {t('SocialConnections.comingSoon')}
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Render fetched ad accounts with currency */}
      <Typography variant="body2" sx={{ marginTop: '20px', pb:'9rem' }}>
        {t('SocialConnections.connectedAccounts') + ' ' + (isConnected ? '1' : '0')}
      </Typography>

      {/* New Feature Announcement */}
      <Box sx={{width:'100%', display:'flex', padding:'2rem', border:'1px solid #F2F4F5', gap:'10px',
            marginTop: 'auto',
      }}>
      
        <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', width:'3rem', height:'3rem', bgcolor: '#F2F4F5',
          borderRadius:'10px'
        }}>
          <img
             src="/assets/googleads.svg"
             alt="Google Ads Icon"
             className={styles.icon}
            />
        </Box>
        <Box sx={{display:'flex', flexDirection:'column'}}>
        <Typography sx={{fontWeight:'600'}}>
          {t('SocialConnections.newFeature')}
        </Typography> 
        <Typography sx={{color:'#859096'}}>
          {t('SocialConnections.googleAdsComingSoon')}
        </Typography>
        </Box>
      </Box>

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
    </Box>
  );
}