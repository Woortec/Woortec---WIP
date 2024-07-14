'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, List, ListItem, ListItemText, Card, CardContent, Divider } from '@mui/material';

// Register Chart.js components
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

const BasicPackage: React.FC = () => {
  const [adInsights, setAdInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdInsights = async () => {
      const accessToken = getItemWithExpiry('fbAccessToken');
      const adAccountId = getItemWithExpiry('fbAdAccount');

      if (!accessToken || !adAccountId) {
        console.error('Access token or ad account ID not found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching ad insights...');
        const response = await axios.get(
          `https://graph.facebook.com/v19.0/${adAccountId}/insights`,
          {
            params: {
              access_token: accessToken,
              fields: 'spend,impressions,reach,cpm,cpc',
              date_preset: 'this_year',
            },
          }
        );

        console.log('Response data:', response.data);
        const insights = response.data.data;
        setAdInsights(insights);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ad insights:', error);
        setLoading(false);
      }
    };

    fetchAdInsights();
  }, []);

  const calculateReach = (spend: number) => spend * 700;

  const calculateExpectedSpend = (timeFrame: string) => {
    const weeks = timeFrame === 'this_year' ? 52 : 1;
    return 50 * weeks;
  };

  const calculateAverage = (insights: any[], field: string) => {
    const total = insights.reduce((acc, insight) => acc + (parseFloat(insight[field]) || 0), 0);
    return insights.length ? total / insights.length : 0;
  };

  const getColor = (value: number, threshold: number, lowerIsBetter: boolean) => {
    return lowerIsBetter ? (value <= threshold ? 'green' : 'red') : (value >= threshold ? 'green' : 'red');
  };

  const getComment = (metric: string, value: number, threshold: number, lowerIsBetter: boolean) => {
    const higher = lowerIsBetter ? `Your ${metric} is higher than the average. Consider optimizing your ad content to reduce costs.` :
      `Your ${metric} is lower than the expected level. Consider increasing your investment or refining your audience targeting.`;
    const lower = lowerIsBetter ? `Great job! Your ${metric} is below the average, indicating efficient ad spend.` :
      `Your ${metric} is performing well above the benchmark, ensuring your ads are seen by a broad audience.`;

    return lowerIsBetter ? (value <= threshold ? lower : higher) : (value >= threshold ? lower : higher);
  };

  const metrics = [
    { name: 'CPC', value: calculateAverage(adInsights, 'cpc'), threshold: 0.09, lowerIsBetter: true },
    { name: 'CPM', value: calculateAverage(adInsights, 'cpm'), threshold: 0.99, lowerIsBetter: true },
    { name: 'Reach', value: calculateReach(calculateAverage(adInsights, 'spend')), threshold: 700, lowerIsBetter: false },
    { name: 'Spent', value: calculateAverage(adInsights, 'spend'), threshold: calculateExpectedSpend('this_year'), lowerIsBetter: false }
  ];

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
                  <TableCell><strong>Metric</strong></TableCell>
                  <TableCell align="right"><strong>Value</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.map(metric => (
                  <TableRow key={metric.name}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell align="right" style={{ color: getColor(metric.value, metric.threshold, metric.lowerIsBetter) }}>
                      {metric.name === 'Reach' ? metric.value.toLocaleString() : `$${metric.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Comments</Typography>
              <List>
                {metrics.map(metric => (
                  <ListItem key={metric.name}>
                    <ListItemText primary={`${metric.name}: ${getComment(metric.name, metric.value, metric.threshold, metric.lowerIsBetter)}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default BasicPackage;
