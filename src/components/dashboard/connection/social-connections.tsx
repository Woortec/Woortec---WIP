'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Modal, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FacebookLogo as FacebookIcon, InstagramLogo as InstagramIcon, LinkedinLogo as LinkedInIcon } from '@phosphor-icons/react';
import { useLocale } from '@/contexts/LocaleContext';
import { createClient } from '../../../../utils/supabase/client';
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
  if (!itemStr) return null;
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

// Load Facebook SDK
const loadFacebookSDK = () => {
  return new Promise<void>((resolve) => {
    if ((window as any).FB) {
      resolve();
      return;
    }

    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId: '843123844562723',
        cookie: true,
        xfbml: true,
        version: 'v21.0'
      });
      resolve();
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement; js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
  });
};

export interface ConnectProps {
  sx?: any;
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
        { scope: 'ads_read, pages_show_list, pages_read_engagement' }
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
    const account = adAccounts.find(acc => acc.id === accountId);
    if (account) {
      setSelectedAdAccount(account);
      setModalOpen(false);
      setPageModalOpen(true);
      fetchPages(userId!, accessToken!);
    }
  };

  const handlePageSelect = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setSelectedPage(page);
      setPageModalOpen(false);
      
      // Store the complete data
      storeDataInSupabase({
        accessToken: accessToken!,
        userId: userId!,
        selectedAdAccount: selectedAdAccount!,
        selectedPage: page,
      });
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
      
      // Clear dashboard cache when switching ad accounts to ensure fresh data
      try {
        const { clearDashboardCache, clearSupabaseCacheForUser } = await import('../../../lib/dashboard-api-service');
        clearDashboardCache();
        if (localUserId) {
          await clearSupabaseCacheForUser(localUserId, selectedAdAccount.id);
        }
        console.log('🧹 Dashboard cache cleared after ad account switch');
        
        // Trigger dashboard data refetch by dispatching custom event
        const adAccountChangeEvent = new CustomEvent('adAccountChanged', {
          detail: {
            adAccountId: selectedAdAccount.id,
            currency: selectedAdAccount.currency,
            userId: localUserId
          }
        });
        window.dispatchEvent(adAccountChangeEvent);
        console.log('🔄 Dispatched adAccountChanged event to trigger dashboard refetch');
      } catch (cacheError) {
        console.warn('⚠️ Could not clear dashboard cache:', cacheError);
      }
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

    // Delete the data from Supabase
    const localUserId = localStorage.getItem('userid');
    await supabase.from('facebookData').delete().eq('user_id', localUserId);
    
    // Clear dashboard cache when disconnecting ad account
    try {
      const { clearDashboardCache, clearSupabaseCacheForUser } = await import('../../../lib/dashboard-api-service');
      clearDashboardCache();
      // Clear all cache entries for this user since they're disconnecting
      if (localUserId) {
        await clearSupabaseCacheForUser(localUserId);
      }
      console.log('🧹 Dashboard cache cleared after ad account disconnect');
      
      // Trigger dashboard data refetch by dispatching custom event
      const adAccountDisconnectEvent = new CustomEvent('adAccountChanged', {
        detail: {
          adAccountId: null,
          currency: null,
          userId: localUserId,
          disconnected: true
        }
      });
      window.dispatchEvent(adAccountDisconnectEvent);
      console.log('🔄 Dispatched adAccountChanged event for disconnect to trigger dashboard refetch');
    } catch (cacheError) {
      console.warn('⚠️ Could not clear dashboard cache:', cacheError);
    }
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography className={styles.title}>{t('SocialConnections.connectTitle')}</Typography>
        <Typography className={styles.subtitle}>{t('SocialConnections.connectSubtitle')}</Typography>
      </Box>

      <Box className={styles.connectionsGrid}>
        {/* Facebook Connection */}
        <Card className={styles.connectionCard}>
          <CardContent className={styles.cardContent}>
            <Box className={styles.cardHeader}>
              <Box className={styles.iconContainer}>
                <FacebookIcon size={32} color="#1877F2" />
              </Box>
              <Box className={styles.cardInfo}>
                <Typography className={styles.platformName}>Facebook</Typography>
                <Typography className={styles.platformDescription}>
                  {isConnected ? t('SocialConnections.connectedFacebook') : t('SocialConnections.connectFacebook')}
                </Typography>
              </Box>
            </Box>
            
            {isConnected ? (
              <Box className={styles.connectedInfo}>
                <Typography className={styles.connectedText}>
                  {t('SocialConnections.connectedFacebookAccount')}
                </Typography>
                <Typography className={styles.accountInfo}>
                  {t('SocialConnections.adAccountId')}: {selectedAdAccount?.id}
                </Typography>
                <Typography className={styles.accountInfo}>
                  {t('SocialConnections.adAccountName')}: {selectedAdAccount?.name}
                </Typography>
                <Typography className={styles.accountInfo}>
                  {t('SocialConnections.currency')}: {selectedAdAccount?.currency}
                </Typography>
                <Typography className={styles.accountInfo}>
                  {t('SocialConnections.connectedPage')}: {selectedPage?.name}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleDisconnectAdAccount}
                  className={styles.disconnectButton}
                >
                  {t('SocialConnections.disconnect')}
                </Button>
              </Box>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleFacebookLogin}
                disabled={!isSdkLoaded}
                className={styles.connectButton}
                startIcon={<FacebookIcon size={20} />}
              >
                {t('SocialConnections.connect')}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Instagram Connection */}
        <Card className={styles.connectionCard}>
          <CardContent className={styles.cardContent}>
            <Box className={styles.cardHeader}>
              <Box className={styles.iconContainer}>
                <InstagramIcon size={32} color="#E4405F" />
              </Box>
              <Box className={styles.cardInfo}>
                <Typography className={styles.platformName}>Instagram</Typography>
                <Typography className={styles.platformDescription}>
                  {t('SocialConnections.connectInstagram')}
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              disabled 
              className={styles.connectButton}
              startIcon={<InstagramIcon size={20} />}
            >
              {t('SocialConnections.comingSoon')}
            </Button>
          </CardContent>
        </Card>

        {/* LinkedIn Connection */}
        <Card className={styles.connectionCard}>
          <CardContent className={styles.cardContent}>
            <Box className={styles.cardHeader}>
              <Box className={styles.iconContainer}>
                <LinkedInIcon size={32} color="#0A66C2" />
              </Box>
              <Box className={styles.cardInfo}>
                <Typography className={styles.platformName}>LinkedIn</Typography>
                <Typography className={styles.platformDescription}>
                  {t('SocialConnections.connectLinkedIn')}
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              disabled 
              className={styles.connectButton}
              startIcon={<LinkedInIcon size={20} />}
            >
              {t('SocialConnections.comingSoon')}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Ad Account Selection Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className={styles.modal}
      >
        <Box className={styles.modalContent}>
          <Typography className={styles.modalTitle}>Select Ad Account</Typography>
          <FormControl fullWidth className={styles.selectContainer}>
            <InputLabel>Ad Account</InputLabel>
            <Select
              value=""
              onChange={(e) => handleAdAccountSelect(e.target.value)}
              displayEmpty
            >
              {adAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Modal>

      {/* Page Selection Modal */}
      <Modal
        open={pageModalOpen}
        onClose={() => setPageModalOpen(false)}
        className={styles.modal}
      >
        <Box className={styles.modalContent}>
          <Typography className={styles.modalTitle}>Select Page</Typography>
          <FormControl fullWidth className={styles.selectContainer}>
            <InputLabel>Page</InputLabel>
            <Select
              value=""
              onChange={(e) => handlePageSelect(e.target.value)}
              displayEmpty
            >
              {pages.map((page) => (
                <MenuItem key={page.id} value={page.id}>
                  {page.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Modal>
    </Box>
  );
}