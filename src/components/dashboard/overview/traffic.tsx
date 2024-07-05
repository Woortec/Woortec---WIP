'use client';

import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

export interface TotalReachProps {
  sx?: SxProps;
}

export function TotalReach({ sx }: TotalReachProps): React.JSX.Element {
  const [chartSeries, setChartSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const chartOptions = useChartOptions(labels);

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
            time_range: JSON.stringify({
              since: '2023-01-01',
              until: '2023-12-31',
            }),
            time_increment: 'day',
          },
        });

        console.log('Response data:', response.data);

        if (!response.data.data || response.data.data.length === 0) {
          throw new Error('No data found for the given ad account ID');
        }

        const reachData = response.data.data;
        const labels = reachData.map((dataPoint: any) => dataPoint.date_stop);
        const chartSeries = reachData.map((dataPoint: any) => dataPoint.impressions);

        setLabels(labels);
        setChartSeries(chartSeries);
      } catch (error) {
        console.error('Error fetching total reach data:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response data:', error.response.data);
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
          <Chart height={300} options={chartOptions} series={[{ name: 'Reach', data: chartSeries }]} type="line" width="100%" />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {chartSeries.map((item, index) => (
              <Stack key={labels[index]} spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h6">{labels[index]}</Typography>
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

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [theme.palette.primary.main],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    stroke: { width: 2 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
    xaxis: {
      categories: labels,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}`,
        style: { colors: theme.palette.text.secondary },
      },
    },
  };
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
