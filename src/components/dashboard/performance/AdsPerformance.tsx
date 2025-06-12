'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Select, MenuItem } from '@mui/material';
import { useLocale } from '@/contexts/LocaleContext';

import AdTable from './AdTable';
import { fetchAdData, getItemWithExpiry, setItemWithExpiry } from './api';
import BudgetInput from './BudgetInput';
import styles from './styles/AdsPerformance.module.css';

const AdsPerformance: React.FC = () => {
  const [adData, setAdData] = useState<any[]>([]);
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<number>(() => getItemWithExpiry('budget') ?? 200);
  const [warningAds, setWarningAds] = useState<number>(0);
  const [successAds, setSuccessAds] = useState<number>(0);
  const { locale, setLocale, t } = useLocale();

  useEffect(() => {
    const fetchData = async () => {
      const { adData, currency } = await fetchAdData();
      setAdData(adData);
      setCurrency(currency);
      setLoading(false);
      calculateAdStats(adData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    setItemWithExpiry('budget', budget, 24 * 60 * 60 * 1000);
  }, [budget]);

  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget);
  };

  const calculateAdStats = (adData: any[]) => {
    let warnings = 0;
    let successes = 0;
    adData.forEach((ad) => {
      if (ad.ctr < 2) {
        warnings += 1;
      } else {
        successes += 1;
      }
    });
    setWarningAds(warnings);
    setSuccessAds(successes);
  };

  return (
    <Box className={styles.container}>
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
              <img src="/assets/error.svg" alt="Warning Icon"/>
            </Box>
            <Box className={styles.summaryContent}>
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',
                '@media (max-width: 675px)': {fontSize: '0.6rem',},
                '@media (max-width: 440px)': {fontSize: '0.4rem',},
              }}>{t('DashboardCards.adsRunning')}</Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontSize: '1.9rem',
                '@media (max-width: 675px)': {fontSize: '1.2rem',},
                '@media (max-width: 440px)': {fontSize: '1.1rem',},
              }}>{warningAds}</Typography>
            </Box>
          </Box>
          
          <Box className={styles.summaryItem}>
            <Box className={`${styles.iconWrapper} ${styles.successIcon}`}>  
              <img src="/assets/editor_choice.svg" alt="Success Icon" />
            </Box>
            <Box className={styles.summaryContent}>
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',
                '@media (max-width: 675px)': {fontSize: '0.6rem',},
                '@media (max-width: 440px)': {fontSize: '0.4rem',},
              }}>{t('DashboardCards.clickThroughRate')}</Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontSize: '1.9rem',
                '@media (max-width: 675px)': {fontSize: '1.2rem',},
                '@media (max-width: 440px)': {fontSize: '1.1rem',},
              }}>{successAds}</Typography>
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
      <AdTable adData={adData} currency={currency} budget={budget} />
    </Box>
  );
};

export default AdsPerformance;