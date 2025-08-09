'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Select, MenuItem, Button, IconButton } from '@mui/material';
import { useLocale } from '@/contexts/LocaleContext';
import { Refresh as RefreshIcon } from '@mui/icons-material';

import AdTable from './AdTable';
import { fetchAdData, getItemWithExpiry, setItemWithExpiry, clearAdDataCache } from './api';
import BudgetInput from './BudgetInput';
import styles from './styles/AdsPerformance.module.css';
import { useUser } from '@/hooks/use-user';

const AdsPerformance: React.FC = () => {
  const [adData, setAdData] = useState<any[]>([]);
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState<number>(() => getItemWithExpiry('budget') ?? 200);
  const [warningAds, setWarningAds] = useState<number>(0);
  const [successAds, setSuccessAds] = useState<number>(0);
  const { locale, setLocale, t } = useLocale();
  const { user } = useUser();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Starting to fetch ad data...');
      console.log('👤 Current user:', user?.id);
      
      const { adData, currency } = await fetchAdData();
      
      console.log('📊 Received ad data:', adData?.length || 0, 'items');
      setAdData(adData || []);
      setCurrency(currency || 'USD');
      calculateAdStats(adData || []);
      
      // If we get an empty array but no error, that's a valid state
      if (adData?.length === 0) {
        console.log('ℹ️ No ad data found - this is a valid state');
      }
    } catch (err) {
      console.error('❌ Error fetching ad data:', err);
      setError('Failed to load ad data. Please try again.');
      setAdData([]);
    } finally {
      setLoading(false);
      console.log('✅ Finished fetching ad data');
    }
  };

  const handleRetry = () => {
    clearAdDataCache(); // Clear cache before retrying
    fetchData();
  };

  const handleRefresh = () => {
    clearAdDataCache(); // Clear cache before refreshing
    fetchData();
  };

  // Check if user has connected Facebook account
  const [hasFacebookConnection, setHasFacebookConnection] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFacebookConnection = async () => {
      if (!user?.id) return;
      
      try {
        const { createClient } = await import('../../../../utils/supabase/client');
        const supabase = createClient();
        const { data, error } = await supabase
          .from('facebookData')
          .select('access_token, account_id')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error checking Facebook connection:', error);
        }
        
        const hasConnection = !!(data?.access_token && data?.account_id);
        setHasFacebookConnection(hasConnection);
        console.log('🔗 Facebook connection status:', hasConnection);
      } catch (err) {
        console.error('Error checking Facebook connection:', err);
        setHasFacebookConnection(false);
      }
    };

    checkFacebookConnection();
  }, [user?.id]);

  useEffect(() => {
    // Only fetch data if we have a user and Facebook connection
    if (user?.id && hasFacebookConnection === true) {
      console.log('👤 User available and Facebook connected, fetching ad data for:', user.id);
      fetchData();
    } else if (user?.id && hasFacebookConnection === false) {
      console.log('⏳ User available but Facebook not connected');
      setLoading(false);
    } else if (user?.id && hasFacebookConnection === null) {
      console.log('⏳ Checking Facebook connection...');
    } else {
      console.log('⏳ Waiting for user to be available...');
      setLoading(false);
    }
  }, [user?.id, hasFacebookConnection]);

  useEffect(() => {
    setItemWithExpiry('budget', budget, 24 * 60 * 60 * 1000);
  }, [budget]);

  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget);
  };

  const calculateAdStats = (adData: any[]) => {
    let totalImpressions = 0;
    let totalReach = 0;
    let totalClicks = 0;
    let totalSpent = 0;
    let avgCtr = 0;
    
    adData.forEach((ad) => {
      totalImpressions += ad.impressions || 0;
      totalReach += ad.reach || 0;
      totalClicks += ad.clicks || 0;
      totalSpent += parseFloat(ad.spend) || 0;
    });
    
    // Calculate average CTR
    if (totalImpressions > 0) {
      avgCtr = (totalClicks / totalImpressions) * 100;
    }
    
    setWarningAds(Math.round(totalImpressions));
    setSuccessAds(avgCtr);
  };

  // Show loading state while waiting for user
  if (!user?.id && !error) {
    return (
      <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  // Show Facebook connection required state
  if (user?.id && hasFacebookConnection === false) {
    return (
      <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: '600', mb: 2, color: '#404D54' }}>
          Connect Your Facebook Account
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3, maxWidth: '500px' }}>
          To view your ad performance data, you need to connect your Facebook account first. 
          This allows us to access your ad data and provide insights.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#486A75', 
            '&:hover': { backgroundColor: '#364FC7' },
            px: 3,
            py: 1.5
          }}
          onClick={() => window.location.href = '/dashboard/social-connections'}
        >
          Connect Facebook Account
        </Button>
      </Box>
    );
  }

  // Show loading state while checking Facebook connection
  if (user?.id && hasFacebookConnection === null) {
    return (
      <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Checking Facebook connection...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Typography sx={{ color: 'error.main', mb: 2 }}>{error}</Typography>
        <Button variant="contained" onClick={handleRetry}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton 
          onClick={handleRefresh} 
          disabled={loading}
          sx={{ color: '#486A75' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      <Box className={styles.summaryCard}>
        <Box className={styles.summaryContainer}>
          <Box className={styles.summaryItem}>
            <Box className={`${styles.iconWrapper} ${styles.budgetIcon}`}>  
              <img src="/assets/attach_money.svg" alt="Budget Icon"/>
            </Box>
            <Box className={styles.summaryContent}>
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',
                    '@media (max-width: 675px)': {fontSize: '0.6rem',},
                    '@media (max-width: 465px)': {fontSize: '0.5rem',},
                    '@media (max-width: 440px)': {fontSize: '0.4rem',},
              }}>{t('DashboardCards.budget')}</Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontSize: '1.9rem',
                '@media (max-width: 675px)': {fontSize: '1.2rem',},
                '@media (max-width: 440px)': {fontSize: '1.1rem',},
              }}>${budget}</Typography>
            </Box>
          </Box>

          <Box className={styles.summaryItem}>
            <Box className={`${styles.iconWrapper} ${styles.warningIcon}`}>  
              <img src="/assets/error.svg" alt="Impressions Icon"/>
            </Box>
            <Box className={styles.summaryContent}>
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',
                '@media (max-width: 675px)': {fontSize: '0.6rem',},
                '@media (max-width: 440px)': {fontSize: '0.4rem',},
              }}>{t('DashboardCards.impressions')}</Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontSize: '1.9rem',
                '@media (max-width: 675px)': {fontSize: '1.2rem',},
                '@media (max-width: 440px)': {fontSize: '1.1rem',},
              }}>{warningAds.toLocaleString()}</Typography>
            </Box>
          </Box>
          
          <Box className={styles.summaryItem}>
            <Box className={`${styles.iconWrapper} ${styles.successIcon}`}>  
              <img src="/assets/editor_choice.svg" alt="CTR Icon" />
            </Box>
            <Box className={styles.summaryContent}>
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',
                '@media (max-width: 675px)': {fontSize: '0.6rem',},
                '@media (max-width: 440px)': {fontSize: '0.4rem',},
              }}>{t('DashboardCards.clickThroughRate')}</Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontSize: '1.9rem',
                '@media (max-width: 675px)': {fontSize: '1.2rem',},
                '@media (max-width: 440px)': {fontSize: '1.1rem',},
              }}>{successAds.toFixed(2)}%</Typography>
            </Box>
          </Box>
        </Box>
        <Box className={styles.legend}>
          <Box className={styles.legendItems}>
            <Box className={styles.legendItem}>
              <Box className={`${styles.legendDot} ${styles.legendDotGood}`} />
              <Typography sx={{ fontSize: '0.8rem', color: '#526067',
                              '@media (max-width: 675px)': {fontSize: '0.6rem',},
            }}>{t('DashboardCards.budget')}</Typography>
            </Box>
            <Box className={styles.legendItem}>
              <Box className={`${styles.legendDot} ${styles.legendDotAverage}`} />
              <Typography sx={{ fontSize: '0.8rem', color: '#526067',
                              '@media (max-width: 675px)': {fontSize: '0.6rem',},
            }}>{t('DashboardCards.impressions')}</Typography>
            </Box>
            <Box className={styles.legendItem}>
              <Box className={`${styles.legendDot} ${styles.legendDotBad}`} />
              <Typography sx={{ fontSize: '0.8rem', color: '#526067',
                              '@media (max-width: 675px)': {fontSize: '0.6rem',},
            }}>{t('DashboardCards.clicks')}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <AdTable adData={adData} currency={currency} budget={budget} loading={loading} />
    </Box>
  );
};

export default AdsPerformance;