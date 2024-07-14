'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

// Register Chart.js components
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

// Helper function to get item with expiry from local storage
const getItemWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

interface AdSet {
  id: string;
  name: string;
}

interface Insight {
  adset_id: string;
  cpm: number;
  cpc: number;
  reach: number;
  spend: number;
}

const BasicPackage: React.FC = () => {
  const [adData, setAdData] = useState<(Insight & { name: string })[]>([]);
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  // Define default thresholds in USD
  const thresholds = {
    cpm: 0.99,
    cpc: 0.09,
    reach: 700, // per dollar spent
    spend: 50 // per week
  };

  // Conversion rates (example rates, should be fetched from an API for real applications)
  const conversionRates: { [key: string]: number } = {
    USD: 1,
    PHP: 50,
    EUR: 0.85,
    GBP: 0.75
  };

  // Convert thresholds based on currency
  const convertThresholds = (currency: string) => {
    const rate = conversionRates[currency] || 1;
    return {
      cpm: thresholds.cpm * rate,
      cpc: thresholds.cpc * rate,
      reach: thresholds.reach,
      spend: thresholds.spend * rate
    };
  };

  const calculateExpectedSpend = (currency: string) => {
    const rate = conversionRates[currency] || 1;
    return thresholds.spend * 4 * rate; // 4 weeks for the last 30 days
  };

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
        // Fetch the ad account details to get the currency
        const accountResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${adAccountId}`,
          {
            params: {
              access_token: accessToken,
              fields: 'currency',
            },
          }
        );
        const adCurrency = accountResponse.data.currency;
        setCurrency(adCurrency);

        const convertedThresholds = convertThresholds(adCurrency);

        console.log('Fetching ad set data...');
        const response = await axios.get(
          `https://graph.facebook.com/v19.0/${adAccountId}/adsets`,
          {
            params: {
              access_token: accessToken,
              fields: 'id,name',
            },
          }
        );

        const adSetIds = response.data.data.map((adSet: AdSet) => adSet.id);
        const adSetNames = response.data.data.reduce((acc: { [key: string]: string }, adSet: AdSet) => {
          acc[adSet.id] = adSet.name;
          return acc;
        }, {});

        const insightsResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${adAccountId}/insights`,
          {
            params: {
              access_token: accessToken,
              fields: 'adset_id,cpm,cpc,reach,spend',
              date_preset: 'last_30d',
              level: 'adset'
            },
          }
        );

        const insights = insightsResponse.data.data.map((insight: Insight) => ({
          ...insight,
          name: adSetNames[insight.adset_id],
        }));

        console.log(insights); // Debugging: log insights data to verify accuracy

        setAdData(insights);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ad set data:', error);
        setLoading(false);
      }
    };

    fetchAdData();
  }, []);

  const getColor = (value: number, threshold: number, lowerIsBetter: boolean) => {
    return lowerIsBetter ? (value <= threshold ? 'lightgreen' : 'lightcoral') : (value >= threshold ? 'lightgreen' : 'lightcoral');
  };

  const formatValue = (value: number, isCurrency: boolean = true) => {
    return isCurrency ? `${Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}` : value.toLocaleString();
  };

  const getComment = (metric: string, value: number, threshold: number, lowerIsBetter: boolean) => {
    const aboveThreshold = lowerIsBetter ? value > threshold : value < threshold;
    switch (metric) {
      case 'CPC':
        return aboveThreshold ? 'Your CPC is higher than the average. Consider optimizing your ad content to reduce costs.' :
          'Great job! Your CPC is below the average, indicating efficient ad spend.';
      case 'CPM':
        return aboveThreshold ? 'Your CPM is above the desired level. Try experimenting with different ad formats and refining your audience segmentation to boost performance.' :
          'Excellent! Your CPM is below the industry standard, showing good ad placement efficiency.';
      case 'Reach':
        return aboveThreshold ? 'Your reach is performing well above the benchmark, ensuring your ads are seen by a broad audience.' :
          'Your reach is below the expected level. Increasing your investment or refining your audience targeting could help.';
      case 'Spent':
        return aboveThreshold ? 'Your spending aligns with our recommendations, showing robust campaign funding.' :
          'Your spending is less than advised. Adjust your budget for better results.';
      default:
        return '';
    }
  };

  const convertedThresholds = convertThresholds(currency);
  const expectedSpend = calculateExpectedSpend(currency);

  return (
    <Box p={3}>
      <Typography variant="h4" align="center" gutterBottom>
        Facebook Ads
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" align="center" gutterBottom>
            Ad Performance Data
          </Typography>
          <TableContainer component={Paper} style={{ marginBottom: '2rem' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>AD SET NAMES</strong></TableCell>
                  <TableCell align="center"><strong>CPC</strong></TableCell>
                  <TableCell align="center"><strong>CPM</strong></TableCell>
                  <TableCell align="center"><strong>REACH</strong></TableCell>
                  <TableCell align="center"><strong>SPENT</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adData.map(ad => (
                  <TableRow key={ad.adset_id}>
                    <TableCell>{ad.name}</TableCell>
                    <TableCell align="center" style={{ backgroundColor: getColor(ad.cpc, convertedThresholds.cpc, true) }}>
                      {formatValue(ad.cpc)}
                      <Tooltip title={getComment('CPC', ad.cpc, convertedThresholds.cpc, true)} arrow>
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" style={{ backgroundColor: getColor(ad.cpm, convertedThresholds.cpm, true) }}>
                      {formatValue(ad.cpm)}
                      <Tooltip title={getComment('CPM', ad.cpm, convertedThresholds.cpm, true)} arrow>
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" style={{ backgroundColor: getColor(ad.reach, ad.spend * convertedThresholds.reach, false) }}>
                      {formatValue(ad.reach, false)}
                      <Tooltip title={getComment('Reach', ad.reach, ad.spend * convertedThresholds.reach, false)} arrow>
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" style={{ backgroundColor: getColor(ad.spend, expectedSpend, false) }}>
                      {formatValue(ad.spend)}
                      <Tooltip title={getComment('Spent', ad.spend, expectedSpend, false)} arrow>
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default BasicPackage;
