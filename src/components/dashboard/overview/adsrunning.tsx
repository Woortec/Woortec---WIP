'use client'

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Binoculars } from '@phosphor-icons/react';
import axios from 'axios';
import { useDate } from './date/DateContext';
import type { SxProps } from '@mui/system';

export interface TotalAdsProps {
  sx?: SxProps;
  value: string;
}

export function TotalAds({ value, sx }: TotalAdsProps): React.JSX.Element {
  return (
    <Card sx={{ ...sx, height: '170px', overflow: 'hidden' }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Ads
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: '#D3346E', height: '56px', width: '56px' }}>
            <Binoculars fontSize="var(--icon-fontSize-lg)" style={{ color: 'white' }} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

const TotalAdsContainer = () => {
  const [adsData, setAdsData] = useState('Loading...');
  const { startDate, endDate } = useDate(); // Make sure this is correctly getting the dates

  useEffect(() => {
    const fetchTotalAds = async () => {
      try {
        const accessToken = getItemWithExpiry('fbAccessToken');
        const adAccountId = getItemWithExpiry('fbAdAccount');

        if (!accessToken || !adAccountId) {
          throw new Error('Missing access token or ad account ID');
        }

        // Ensure startDate and endDate are not null before proceeding
        if (!startDate || !endDate) return;

        // Fetch all ads within the selected date range
        const response = await axios.get(`https://graph.facebook.com/v20.0/${adAccountId}/ads`, {
          params: {
            access_token: accessToken,
            fields: 'effective_status',
            time_range: JSON.stringify({
              since: startDate.toISOString().split('T')[0],
              until: endDate.toISOString().split('T')[0],
            }),
          },
        });

        const totalAdsCount = response.data.data.length;
        const activeAdsCount = response.data.data.filter((ad: any) => ad.effective_status === 'ACTIVE').length;

        setAdsData(`${activeAdsCount} Active ads`);
      } catch (error) {
        console.error('Error fetching total ads data:', error);
        setAdsData('Error loading ads');
      }
    };

    // Re-fetch ads data whenever the date range changes
    if (startDate && endDate) {
      fetchTotalAds();
    }
  }, [startDate, endDate]); // This ensures the effect runs when the date changes

  return <TotalAds value={adsData} />;
};

export default TotalAdsContainer;

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
