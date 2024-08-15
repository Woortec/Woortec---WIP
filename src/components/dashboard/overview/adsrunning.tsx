'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowUDownRight } from '@phosphor-icons/react';
import axios from 'axios';
import { useDate } from './date/DateContext';
import type { SxProps } from '@mui/system';

export interface TotalProfitProps {
  sx?: SxProps;
  value: string;
}

export function TotalProfit({ value, sx }: TotalProfitProps): React.JSX.Element {
  return (
    <Card sx={{ ...sx, height: '170px', overflow: 'hidden' }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Ads Running
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: '#D3346E', height: '56px', width: '56px' }}>
            <ArrowUDownRight fontSize="var(--icon-fontSize-lg)" style={{ color: 'white' }} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

const TotalProfitContainer = () => {
  const [totalAds, setTotalAds] = useState('');
  const { startDate, endDate } = useDate();

  useEffect(() => {
    const fetchTotalAds = async () => {
      try {
        const accessToken = getItemWithExpiry('fbAccessToken');
        const adAccountId = getItemWithExpiry('fbAdAccount');

        if (!accessToken) {
          throw new Error('Missing access token');
        }

        if (!adAccountId) {
          throw new Error('Missing ad account ID');
        }

        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/ads`, {
          params: {
            access_token: accessToken,
            fields: 'status',
            time_range: JSON.stringify({
              since: startDate?.toISOString().split('T')[0], 
              until: endDate?.toISOString().split('T')[0]
            }),
          },
        });

        const activeAdsCount = response.data.data.filter((ad: any) => ad.status === 'ACTIVE').length;

        setTotalAds(activeAdsCount.toString());
      } catch (error) {
        console.error('Error fetching total ads data:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    };

    fetchTotalAds();
  }, [startDate, endDate]);

  return <TotalProfit value={totalAds} />;
};

export default TotalProfitContainer;

// Utility function to get item from localStorage with expiry
function getItemWithExpiry(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Error parsing item from localStorage', error);
    return null;
  }
}
