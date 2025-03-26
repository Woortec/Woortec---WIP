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
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { ArrowUDownRight as RunningIcon } from '@phosphor-icons/react';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';


export interface TotalAdsProps {
  sx?: SxProps;
  value: string;
}

export function TotalAds({ value, sx }: TotalAdsProps): React.JSX.Element {
  return (
    <Card sx={{ height: '10.7rem'}}>
      <Box sx={{padding:'1rem'}}>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Avatar sx={{ backgroundColor: '#D3346E', height: '2rem', width: '2rem', }}>
              <RunningIcon fontSize="1.5rem" style={{ color: 'white' }} />
            </Avatar>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '2.3rem', bgcolor: '#F2F4F5', borderRadius: '20px' }}>
               <IconButton><LikeIcon size="1.2rem" /></IconButton>
             </Box>

        </Box>

          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Stack>
              <Typography sx={{paddingTop:'0.7rem', fontSize:'0.7rem'}} color="text.secondary">ADS RUNNING</Typography>
              <Typography variant="h4" sx={{paddingBottom:'0.7rem', fontSize:'1.5rem', 
                 '@media (min-width: 1200px) and (max-width: 1256px)': {fontSize: '1.4rem'},
                fontWeight:'600'}}>{value}</Typography>
            </Stack>
          </Stack>

            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <Typography variant="body2" sx={{fontSize:'0.9rem', color:'red',}}>
                ↓ 52.67%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption" sx={{fontSize:'0.7rem'}}>
                Last month
              </Typography>
            </Stack>

      </Box>
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