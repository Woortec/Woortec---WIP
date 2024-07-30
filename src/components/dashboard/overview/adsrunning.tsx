'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react';
import axios from 'axios';

export interface TotalProfitProps {
  sx?: SxProps;
  value: string;
}

export function TotalProfit({ value, sx }: TotalProfitProps): React.JSX.Element {
  return (
    <Card sx={{ ...sx, height: '170px', overflow: 'hidden' }}> {/* Setting a fixed height */}
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Ads Running
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

const TotalProfitContainer = () => {
  const [totalAds, setTotalAds] = useState('');

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

        console.log('Access Token:', accessToken);
        console.log('Ad Account ID:', adAccountId);

        // Fetch the total number of active ads for the Facebook ad account
        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/ads`, {
          params: {
            access_token: accessToken,
            fields: 'status',
          },
        });

        console.log('Response data:', response.data);

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
  }, []);

  return <TotalProfit value={totalAds} />;
};

export default TotalProfitContainer;

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
