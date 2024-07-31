'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, TextField } from '@mui/material';
import AdTable from './AdTable';
import { getItemWithExpiry, setItemWithExpiry } from './helperFunctions';
import styles from './styles/AdPerformanceCard.module.css';

interface MetricProps {
  icon: string;
  label: string;
  value: string | number;
  iconClass: string;
}

const Metric: React.FC<MetricProps> = ({ icon, label, value, iconClass }) => (
  <div className={styles.metricGroup}>
    <div className={`${styles.iconWrapper} ${styles[iconClass]}`}>
      <img src={icon} alt="" className={styles.icon} />
    </div>
    <div className={styles.metricInfo}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  </div>
);

interface LegendItemProps {
  color: string;
  label: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => (
  <div className={styles.legendItem}>
    <div className={`${styles.legendDot} ${styles[`${color}Dot`]}`} />
    <div className={styles.legendText}>{label}</div>
  </div>
);

interface AdPerformanceCardProps {
  budget: number;
  warningAds: number;
  successAds: number;
}

const AdPerformanceCard: React.FC<AdPerformanceCardProps> = ({ budget, warningAds, successAds }) => (
  <section className={styles.card}>
    <div className={styles.metricsContainer}>
      <Metric
        icon="https://cdn.builder.io/api/v1/image/assets/TEMP/df131ba591ec1c17f195db8ff0977e61eae7fd0220ab965168a18a19d165b5bb?apiKey=415fe05812414bd2983a5d3a1f882fdf&&apiKey=415fe05812414bd2983a5d3a1f882fdf"
        label="Monthly Budget"
        value={`$ ${budget}`}
        iconClass="budgetIcon"
      />
      <Metric
        icon="https://cdn.builder.io/api/v1/image/assets/TEMP/1d6592a4dd52b8107a8ae5c88355f205d687257de9d7a00af653e5d5b7b0a39a?apiKey=415fe05812414bd2983a5d3a1f882fdf&&apiKey=415fe05812414bd2983a5d3a1f882fdf"
        label="Warning Ads"
        value={warningAds}
        iconClass="warningIcon"
      />
      <Metric
        icon="https://cdn.builder.io/api/v1/image/assets/TEMP/5ec8655b95ca1797305e6bf21f89154a1a7952e227db41d54d9763259c45dbbf?apiKey=415fe05812414bd2983a5d3a1f882fdf&&apiKey=415fe05812414bd2983a5d3a1f882fdf"
        label="Success Ads"
        value={successAds}
        iconClass="successIcon"
      />
    </div>
    <div className={styles.legend}>
      <div className={styles.legendItems}>
        <LegendItem color="good" label="Good" />
        <LegendItem color="average" label="Average" />
        <LegendItem color="bad" label="Bad" />
      </div>
    </div>
  </section>
);

const AdsPerformance: React.FC = () => {
  const [adData, setAdData] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(() => getItemWithExpiry('budget') || 200);
  const [warningAds, setWarningAds] = useState(0);
  const [successAds, setSuccessAds] = useState(0);

  useEffect(() => {
    const fetchAdData = async () => {
      const accessToken = getItemWithExpiry('fbAccessToken');
      const adAccountId = getItemWithExpiry('fbAdAccount');

      if (!accessToken || !adAccountId) {
        console.error('Access token or ad account ID not found');
        setLoading(false);
        return;
      }

      try {
        const accountResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}`, {
          params: { access_token: accessToken, fields: 'currency' }
        });
        const adCurrency = accountResponse.data.currency;
        setCurrency(adCurrency);

        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/adsets`, {
          params: { access_token: accessToken, fields: 'id,name' }
        });

        const adSetIds = response.data.data.map((adSet: { id: string }) => adSet.id);
        const adSetNames = response.data.data.reduce((acc: { [key: string]: string }, adSet: { id: string, name: string }) => {
          acc[adSet.id] = adSet.name;
          return acc;
        }, {});

        const insightsResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: { access_token: accessToken, fields: 'adset_id,cpm,cpc,impressions,spend', date_preset: 'last_30d', level: 'adset' }
        });

        const insights = insightsResponse.data.data.map((insight: any) => ({
          ...insight,
          name: adSetNames[insight.adset_id],
        }));

        setAdData(insights);

        // Calculate warning and success ads based on criteria
        const warnings = insights.filter((insight: any) => insight.cpc > 10 || insight.cpm > 100).length;
        const successes = insights.filter((insight: any) => insight.cpc <= 10 && insight.cpm <= 100).length;

        setWarningAds(warnings);
        setSuccessAds(successes);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching ad set data:', error);
        setLoading(false);
      }
    };

    fetchAdData();
  }, []);

  useEffect(() => {
    setItemWithExpiry('budget', budget, 24 * 60 * 60 * 1000); // Save budget to localStorage with 1 day expiry
  }, [budget]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBudget = Number(e.target.value);
    setBudget(newBudget);
    setItemWithExpiry('budget', newBudget, 24 * 60 * 60 * 1000); // Save budget to localStorage with 1 day expiry
  };

  return (
    <Box p={3}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <AdPerformanceCard budget={budget} warningAds={warningAds} successAds={successAds} />
          <Box mt={4} width="100%">
            <AdTable adData={adData} currency={currency} budget={budget} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdsPerformance;
