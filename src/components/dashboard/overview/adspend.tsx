'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, CardHeader, Divider, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import dayjs from 'dayjs';
import { DateRangePicker } from './DateRangePicker';

export interface SalesProps {
  sx?: SxProps;
  timeRange: string;
}

interface TimeRange {
  since: string;
  until: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

const getTimeRanges = (): { [key: string]: TimeRange } => {
  const today = dayjs();
  return {
    day: {
      since: today.subtract(1, 'day').format('YYYY-MM-DD'),
      until: today.format('YYYY-MM-DD'),
    },
    week: {
      since: today.subtract(1, 'week').format('YYYY-MM-DD'),
      until: today.format('YYYY-MM-DD'),
    },
    month: {
      since: today.subtract(1, 'month').format('YYYY-MM-DD'),
      until: today.format('YYYY-MM-DD'),
    },
    year: {
      since: today.startOf('year').format('YYYY-MM-DD'),
      until: today.format('YYYY-MM-DD'),
    },
  };
};

export function Sales({ sx, timeRange }: SalesProps): React.JSX.Element {
  const theme = useTheme();
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const timeRanges = getTimeRanges();

  const fetchAdSpendData = async (range: string) => {
    try {
      const accessToken = getItemWithExpiry('fbAccessToken');
      const adAccountId = getItemWithExpiry('fbAdAccount');

      if (!accessToken) {
        throw new Error('Missing access token');
      }

      if (!adAccountId) {
        throw new Error('Missing ad account ID');
      }

      const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'spend',
          time_range: JSON.stringify(timeRanges[range]),
          time_increment: range === 'year' ? 'monthly' : 'daily',
        },
      });

      console.log('Raw Response Data:', response.data);

      if (response.data.data && response.data.data.length > 0) {
        const labels = response.data.data.map((item: any) => item.date_start);
        const data = response.data.data.map((item: any) => parseFloat(item.spend));
        const formattedData: ChartData = {
          labels,
          datasets: [{
            label: 'Ad Spend',
            data,
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
            fill: true,
          }],
        };
        setChartData(formattedData);
      } else {
        console.log('No data found in the response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching ad spend data:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdSpendData(timeRange);
  }, [timeRange]);

  return (
    <Card sx={sx}>
      <CardHeader
        title="Ad Spend"
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
            onClick={() => fetchAdSpendData(timeRange)}
          >
            Sync
          </Button>
        }
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}}} height={350} />
        )}
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button color="inherit" endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} size="small">
          Overview
        </Button>
      </CardActions>
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
