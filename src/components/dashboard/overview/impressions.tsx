'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon } from '@phosphor-icons/react';
import { Target } from '@phosphor-icons/react';
import axios from 'axios';
import dayjs from 'dayjs';
import { createClient } from '../../../../utils/supabase/client'; // Adjust path to Supabase client
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';
import { useLocale } from '@/contexts/LocaleContext';

export interface TotalImpressionsProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}

export function TotalImpressions({ diff, trend, sx, value }: TotalImpressionsProps): React.JSX.Element {
    const { t } = useLocale();

  console.log(value);
  console.log(diff);
  console.log(trend);
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ height: '10.7rem',}}>
      <Box sx={{padding:'1rem'}}>
         <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Avatar sx={{ backgroundColor: '#E86A6D', height: '2rem', width: '2rem'}}>
              <Target fontSize="1.5rem" style={{ color: 'white' }} />
            </Avatar>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '2.3rem', bgcolor: '#F2F4F5', borderRadius: '20px' }}>
               <IconButton><LikeIcon size="1.2rem" /></IconButton>
             </Box>
          </Box>

        <Box sx={{display:'flex',}}>
          <Box sx={{width:'100%',}}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack>
              <Typography sx={{paddingTop:'0.7rem', fontSize:'0.7rem'}} color="text.secondary">{t('DashboardCards.impressions')}</Typography>
              <Typography variant="h4" sx={{paddingBottom:'0.7rem', fontSize:'1.5rem', fontWeight:'600'}}>{value === '' ? 'data not found' : value}</Typography>
            </Stack>
          </Stack>
          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} sx={{fontSize:'1rem'}}>
                  {diff.toFixed(2)}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{fontSize:'0.7rem'}}>
                {t('DashboardCards.lastMonth')}
              </Typography>
            </Stack>
          ) : null}
          </Box>

          <Box sx={{width: '35%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ marginTop: 'auto',}}>
              <Box sx={{ color: '#859096', textAlign:'center'}}>0</Box>
              <Box sx={{ color: '#859096', fontSize: '0.5rem', textAlign:'center' }}>{t('DashboardCards.clicks')}</Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </Card>
  );
}

interface TotalImpressionsContainerProps {
  startDate: Date | null;
  endDate: Date | null;
}

const TotalImpressionsContainer = ({ startDate, endDate }: TotalImpressionsContainerProps) => {
  const [impressionsData, setImpressionsData] = useState<{ value: string; diff: number; trend: 'up' | 'down' }>(
    {
      value: '',
      diff: 0,
      trend: 'up',
    }
  );

  const fetchImpressions = async () => {
    try {
      const supabase = createClient();
      const userId = localStorage.getItem('userid'); // Fetch userId from localStorage

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

      // Fetch the total impressions for the selected date range
      const response = await axios.get(`https://graph.facebook.com/v21.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'impressions',
          time_range: JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          }),
        },
      });
      console.log(response);
      

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('No data found for the given ad account ID');
      }

      const totalImpressions = response.data.data.reduce(
        (acc: number, item: any) => acc + parseInt(item.impressions, 10),
        0
      );

      console.log(totalImpressions);
      
      // Format the total impressions with commas as thousands separators
      const formattedImpressions = new Intl.NumberFormat('en-US').format(totalImpressions);

      console.log(formattedImpressions);
      
      // Fetch the previous total impressions for comparison
      const previousResponse = await axios.get(`https://graph.facebook.com/v21.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'impressions',
          date_preset: 'last_month',
        },
      });

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
        value: formattedImpressions,
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

  useEffect(() => {
    if (startDate && endDate) {
      fetchImpressions();
    }
  }, [startDate, endDate]); // Trigger the effect whenever the start or end date changes

  return <TotalImpressions {...impressionsData} />;
};

export default TotalImpressionsContainer;