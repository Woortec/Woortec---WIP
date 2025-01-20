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
import { createClient } from '../../../../utils/supabase/client'; // Adjust the path to your Supabase client

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
        const supabase = createClient();
        const userId = localStorage.getItem('userid'); // Fetch the userId from localStorage (if applicable)

        if (!userId) {
          throw new Error('User ID is missing.');
        }

        // Fetch access token and ad account ID from Supabase
        const { data, error } = await supabase
          .from('facebookData')
          .select('access_token, account_id')
          .eq('user_id', userId)
          .single();

        if (error) {
          throw new Error('Error fetching data from Supabase.');
        }

        const { access_token: accessToken, account_id: adAccountId } = data;

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
