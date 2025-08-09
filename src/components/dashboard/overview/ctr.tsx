'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon } from '@phosphor-icons/react';
import { CursorClick } from '@phosphor-icons/react';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';
import { ThumbsDown as DislikeIcon } from '@phosphor-icons/react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useLocale } from '@/contexts/LocaleContext';
import { createClient } from '../../../../utils/supabase/client';
import axios from 'axios';
import dayjs from 'dayjs';

export interface CTRProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: any;
  value: string;
}

export function CTR({
  diff,
  trend,
  sx,
  value
}: CTRProps): React.JSX.Element {
  const { t } = useLocale();
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ height: '10.7rem' }}>
      <Box sx={{ padding: '1rem' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Avatar sx={{ backgroundColor: '#FFDDA0', height: '2rem', width: '2rem' }}>
            <CursorClick fontSize="1.5rem" style={{ color: 'white' }} />
          </Avatar>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '4.5rem', bgcolor: '#F2F4F5', borderRadius: '20px' }}>
            <IconButton><LikeIcon size="1.2rem" /></IconButton>
            <IconButton sx={{ transform: 'scaleX(-1)' }}><DislikeIcon size="1.2rem" /></IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
              <Stack>
                <Typography sx={{ paddingTop: '0.7rem', fontSize: '0.7rem' }} color="text.secondary">
                  {t('DashboardCards.clickThroughRate')}
                </Typography>
                <Typography variant="h4" sx={{ paddingBottom: '0.7rem', fontSize: '1.5rem', fontWeight: '600' }}>
                  {value === '' ? 'data not found' : value}
                </Typography>
              </Stack>
            </Stack>
            {diff ? (
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                  <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                  <Typography color={trendColor} sx={{ fontSize: '1rem' }}>
                    {diff.toFixed(2)}%
                  </Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {t('DashboardCards.lastMonth')}
                </Typography>
              </Stack>
            ) : null}
          </Box>

          <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ marginTop: 'auto' }}>
              <Box sx={{ color: '#859096', textAlign: 'center' }}>0</Box>
              <Box sx={{ color: '#859096', fontSize: '0.5rem', textAlign: 'center' }}>
                {t('DashboardCards.clicks')}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

interface CTRContainerProps {
  startDate: Date | null;
  endDate: Date | null;
}

const CTRContainer = ({
  startDate,
  endDate
}: CTRContainerProps) => {
  const [ctrData, setCtrData] = useState<{
    value: string;
    diff: number;
    trend: 'up' | 'down';
  }>({
    value: '',
    diff: 0,
    trend: 'up'
  });

  const fetchCTR = async () => {
    try {
      const supabase = createClient();
      const userId = localStorage.getItem('userid');
      if (!userId) throw new Error('User ID is missing.');

      const { data, error } = await supabase
        .from('facebookData')
        .select('access_token, account_id')
        .eq('user_id', userId)
        .single();
      if (error || !data) throw new Error('Error fetching data from Supabase.');

      const { access_token: accessToken, account_id: adAccountId } = data;
      if (!accessToken || !adAccountId) throw new Error('Missing access token or ad account ID');

      // Current period insights
      const currentRes = await axios.get(
        `https://graph.facebook.com/v20.0/${adAccountId}/insights`,
        {
          params: {
            access_token: accessToken,
            fields: 'impressions,clicks,ctr',
            time_range: JSON.stringify({
              since: dayjs(startDate).format('YYYY-MM-DD'),
              until: dayjs(endDate).format('YYYY-MM-DD')
            }),
            level: 'ad'
          }
        }
      );
      
      // Calculate CTR from current data
      const currentData = currentRes.data.data[0] || { impressions: 0, clicks: 0, ctr: 0 };
      let currentCtr = 0;
      
      if (currentData.ctr !== undefined && currentData.ctr !== null) {
        // Use Facebook's provided CTR
        currentCtr = currentData.ctr * 100;
      } else if (currentData.impressions > 0 && currentData.clicks > 0) {
        // Calculate CTR manually if not provided
        currentCtr = (currentData.clicks / currentData.impressions) * 100;
      }

      // Previous period insights
      const prevRes = await axios.get(
        `https://graph.facebook.com/v20.0/${adAccountId}/insights`,
        {
          params: {
            access_token: accessToken,
            fields: 'impressions,clicks,ctr',
            date_preset: 'last_month',
            level: 'ad'
          }
        }
      );
      
      // Calculate CTR from previous data
      const prevData = prevRes.data.data[0] || { impressions: 0, clicks: 0, ctr: 0 };
      let prevCtr = 0;
      
      if (prevData.ctr !== undefined && prevData.ctr !== null) {
        // Use Facebook's provided CTR
        prevCtr = prevData.ctr * 100;
      } else if (prevData.impressions > 0 && prevData.clicks > 0) {
        // Calculate CTR manually if not provided
        prevCtr = (prevData.clicks / prevData.impressions) * 100;
      }

      const diff = prevCtr > 0
        ? ((currentCtr - prevCtr) / prevCtr) * 100
        : 0;
      const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';

      const formatted = `${currentCtr.toFixed(2)}%`;

      setCtrData({ value: formatted, diff: Math.abs(diff), trend });
    } catch (err) {
      console.error('Error fetching CTR data:', err);
      setCtrData({ value: '', diff: 0, trend: 'up' });
    }
  };

  useEffect(() => {
    if (startDate && endDate) fetchCTR();
  }, [startDate, endDate]);

  return <CTR {...ctrData} />;
};

export default CTRContainer;
