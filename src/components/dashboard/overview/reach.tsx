'use client';

import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SxProps } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export interface TotalReachProps {
  sx?: SxProps;
}

export function TotalReach({ sx }: TotalReachProps): React.JSX.Element {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Reach',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const fetchTotalReach = async () => {
      try {
        const accessToken = getItemWithExpiry('fbAccessToken');
        const adAccountId = getItemWithExpiry('fbAdAccount');

        if (!accessToken) {
          throw new Error('Missing access token');
        }

        if (!adAccountId) {
          throw new Error('Missing ad account ID');
        }

        console.log('Access Token:', accessToken);
        console.log('Ad Account ID:', adAccountId);

        // Fetch the total reach for the ad account
        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'impressions',
            date_preset: 'this_year',
          },
        });

        console.log('Response data:', response.data);

        if (!response.data.data || response.data.data.length === 0) {
          throw new Error('No data found for the given ad account ID');
        }

        const reachData = response.data.data;
        const labels = reachData.map((dataPoint: any) => dataPoint.date_stop);
        const data = reachData.map((dataPoint: any) => dataPoint.impressions);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Reach',
              data: data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching total reach data:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response data:', error.response.data);
        } else {
          console.error(error);
        }
      }
    };

    fetchTotalReach();
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Total Reach" />
      <CardContent>
        <Stack spacing={2}>
          <Line data={chartData} />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {chartData.datasets[0].data.map((item, index) => (
              <Stack key={chartData.labels[index]} spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h6">{chartData.labels[index]}</Typography>
                <Typography color="text.secondary" variant="subtitle2">
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Utility function to get item from localStorage with expiry
function getItemWithExpiry(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  // If the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    // Compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage and return null
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Error parsing item from localStorage', error);
    return null;
  }
}
