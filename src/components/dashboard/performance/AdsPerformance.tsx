'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

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
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',}}> Monthly Budget </Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontFamily:'Poppins', fontSize: '1.9rem',}}>${budget}</Typography>
            </Box>
          </Box>

          <Box className={styles.summaryItem}>
            <Box className={`${styles.iconWrapper} ${styles.warningIcon}`}>
              <img src="/assets/error.svg" alt="Warning Icon"/>
            </Box>
            <Box className={styles.summaryContent}>
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',}}>Warning Ads</Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontFamily:'Poppins', fontSize: '1.9rem',}}>{warningAds}</Typography>
            </Box>
          </Box>
          
          <Box className={styles.summaryItem}>
            <Box className={`${styles.iconWrapper} ${styles.successIcon}`}>
              <img src="/assets/editor_choice.svg" alt="Success Icon" />
            </Box>
            <Box className={styles.summaryContent}>
              <Typography className={styles.summaryLabel} sx={{ color: '#526067', fontSize: '0.8rem',}}>Success Ads</Typography>
              <Typography className={styles.summaryValue} sx={{ fontWeight:'600', fontFamily:'Poppins', fontSize: '1.9rem',}}>{successAds}</Typography>
            </Box>
          </Box>

        </Box>
        
        <Box className={styles.legend}>
          <Box className={styles.legendItems}>
            <Box className={styles.legendItem}>
              <Box className={`${styles.legendDot} ${styles.legendDotGood}`} />
              <Typography sx={{ fontSize: '0.8rem', color: '#526067',
            }}>Good</Typography>
            </Box>
            <Box className={styles.legendItem}>
              <Box className={`${styles.legendDot} ${styles.legendDotAverage}`} />
              <Typography sx={{ fontSize: '0.8rem', color: '#526067',
            }}>Average</Typography>
            </Box>
            <Box className={styles.legendItem}>
              <Box className={`${styles.legendDot} ${styles.legendDotBad}`} />
              <Typography sx={{ fontSize: '0.8rem', color: '#526067',
            }}>Bad</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
        <AdTable adData={adData} currency={currency} budget={budget} />
    </Box>
  );
};

export default AdsPerformance;