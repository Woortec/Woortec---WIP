'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Grid, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
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
  const [adData, setAdData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: 'Amount spent (PHP)',
        data: [],
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
      },
    ],
  });

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
        const response = await axios.get(
          `https://graph.facebook.com/v13.0/${adAccountId}/ads`,
          {
            params: {
              access_token: accessToken,
              fields: 'name,adset_id,campaign_id,created_time,spend,cost_per_click,cost_per_inline_post_engagement,cost_per_message',
              date_preset: 'last_30d',
            },
          }
        );

        const ads = response.data.data;

        const labels = ads.map((ad: any) => ad.name);
        const spendData = ads.map((ad: any) => ad.spend);

        setAdData(ads);
        setChartData({
          labels,
          datasets: [
            {
              label: 'Amount spent (PHP)',
              data: spendData,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching ad data:', error);
        setLoading(false);
      }
    };

    fetchAdData();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" align="center" gutterBottom>
        BASIC PACKAGE
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="subtitle1">How Many Ads were run?</Typography>
                <Typography variant="h6">{adData.length}</Typography>
                {/* You can calculate percentage change based on historical data */}
                <Typography variant="body2" color="error">-66.4%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="subtitle1">How Much was spent?</Typography>
                <Typography variant="h6">₱{adData.reduce((sum, ad) => sum + parseFloat(ad.spend || 0), 0).toFixed(2)}</Typography>
                {/* You can calculate percentage change based on historical data */}
                <Typography variant="body2" color="error">-59.0%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="subtitle1">Which is the budget remaining?</Typography>
                <Typography variant="h6">0</Typography>
              </Box>
            </Grid>
          </Grid>
          <TableContainer component={Paper} sx={{ marginY: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ad Set Name</TableCell>
                  <TableCell>Cost Per Click</TableCell>
                  <TableCell>Ad Name</TableCell>
                  <TableCell>Cost Per Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adData.map((ad, index) => (
                  <TableRow key={index}>
                    <TableCell>{ad.adset_id}</TableCell>
                    <TableCell>{ad.cost_per_click ? ad.cost_per_click.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{ad.name}</TableCell>
                    <TableCell>{ad.cost_per_message ? ad.cost_per_message.toFixed(2) : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box>
            <Line data={chartData} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default BasicPackage;
