'use client'

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Target } from '@phosphor-icons/react';
import axios from 'axios';
import { useDate } from './date/DateContext'; // Import the useDate hook

export interface TotalImpressionsProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}

export function TotalImpressions({ diff, trend, sx, value }: TotalImpressionsProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ ...sx, height: '170px', overflow: 'hidden' }}> {/* Setting a fixed height */}
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Impressions
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: '#E86A6D', height: '56px', width: '56px' }}>
              <Target fontSize="var(--icon-fontSize-lg)" style={{ color: 'white' }} />
            </Avatar>
          </Stack>
          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff.toFixed(2)}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

const TotalImpressionsContainer = () => {
  const [impressionsData, setImpressionsData] = useState<{ value: string; diff: number; trend: 'up' | 'down' }>({
    value: '',
    diff: 0,
    trend: 'up',
  });

  const { startDate, endDate } = useDate(); // Use the useDate hook to get the start and end dates

  useEffect(() => {
    const fetchImpressions = async () => {
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

        // Fetch the total impressions for the selected date range
        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'impressions',
            time_range: JSON.stringify({
              since: startDate?.toISOString().split('T')[0],
              until: endDate?.toISOString().split('T')[0],
            }),
          },
        });

        console.log('Response data:', response.data);

        if (!response.data.data || response.data.data.length === 0) {
          throw new Error('No data found for the given ad account ID');
        }

        const totalImpressions = response.data.data.reduce(
          (acc: number, item: any) => acc + parseInt(item.impressions, 10),
          0
        );

        // Fetch the previous total impressions for comparison
        const previousResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'impressions',
            date_preset: 'last_month',
          },
        });

        console.log('Previous response data:', previousResponse.data);

        if (!previousResponse.data.data || previousResponse.data.data.length === 0) {
          throw new Error('No data found for the previous time period');
        }

        const previousImpressions = previousResponse.data.data.reduce(
          (acc: number, item: any) => acc + parseInt(item.impressions, 10),
          0
        );

        const diff = ((totalImpressions - previousImpressions) / previousImpressions) * 100;
        const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';

        setImpressionsData({
          value: totalImpressions.toString(),
          diff: Math.abs(diff),
          trend: trend,
        });
      } catch (error) {
        console.error('Error fetching impressions data:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    };

    fetchImpressions();
  }, [startDate, endDate]); // Trigger the effect whenever the start or end date changes

  return <TotalImpressions {...impressionsData} />;
};

export default TotalImpressionsContainer;

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
