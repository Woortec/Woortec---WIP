'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon, ChatText } from '@phosphor-icons/react';
import axios from 'axios';
import dayjs from 'dayjs';
import { createClient } from '../../../../utils/supabase/client';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';
import styles from './date/style/DatePickerComponent.module.css';

export interface TotalCostPerMessageProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: any;
  value: string;
}

export function TotalCostPerMessage({
  diff,
  trend,
  sx,
  value
}: TotalCostPerMessageProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up'
    ? 'var(--mui-palette-success-main)'
    : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ height: '10.7rem', ...sx }}>
      <Box sx={{ padding: '1rem' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Avatar sx={{ backgroundColor: '#FFC456', height: '2rem', width: '2rem' }}>
            <ChatText fontSize="1.5rem" style={{ color: 'white' }} />
          </Avatar>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '2.3rem',
              bgcolor: '#F2F4F5',
              borderRadius: '20px'
            }}
          >
            <IconButton><LikeIcon size="1.2rem" /></IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '100%' }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
              spacing={3}
            >
              <Stack>
                <Typography
                  sx={{
                    paddingTop: '0.7rem',
                    fontSize: { sm: '0.7rem', md: '0.7rem' },
                    '@media (min-width: 1200px) and (max-width: 1256px)': { fontSize: '0.6rem' }
                  }}
                  color="text.secondary"
                >
                  CLICK THROUGH RATE
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ paddingBottom: '0.7rem', fontSize: '1.5rem', fontWeight: '600' }}
                >
                  {value}
                </Typography>
              </Stack>
            </Stack>
            {diff != null && (
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                  <TrendIcon color={trendColor} />
                  <Typography color={trendColor} variant="body2" sx={{ fontSize: '0.9rem' }}>
                    {diff.toFixed(2)}%
                  </Typography>
                </Stack>
                <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.7rem' }}>
                  Last month
                </Typography>
              </Stack>
            )}
          </Box>

          <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ marginTop: 'auto' }}>
              <Box sx={{ color: '#859096', textAlign: 'center' }}>0</Box>
              <Box sx={{ color: '#859096', fontSize: '0.5rem', textAlign: 'center' }}>
                N Messages
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

interface TotalCostPerMessageContainerProps {
  startDate: Date | null;
  endDate: Date | null;
}

const TotalCostPerMessageContainer = ({
  startDate,
  endDate
}: TotalCostPerMessageContainerProps) => {
  const [costData, setCostData] = useState<{
    value: string;
    diff: number;
    trend: 'up' | 'down';
  }>({
    value: '',
    diff: 0,
    trend: 'up'
  });

  const fetchTotalCostPerMessage = async () => {
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

      // Get currency
      const accountDetails = await axios.get(
        `https://graph.facebook.com/v20.0/${adAccountId}`,
        { params: { access_token: accessToken, fields: 'currency' } }
      );
      const currency = accountDetails.data.currency;

      // Current period insights
      const currentRes = await axios.get(
        `https://graph.facebook.com/v20.0/${adAccountId}/insights`,
        {
          params: {
            access_token: accessToken,
            fields: 'actions,spend',
            time_range: JSON.stringify({
              since: dayjs(startDate).format('YYYY-MM-DD'),
              until: dayjs(endDate).format('YYYY-MM-DD')
            })
          }
        }
      );
      const currentData = currentRes.data.data[0] || { actions: [], spend: '0' };
      const spend = parseFloat(currentData.spend);
      const messagingActions = (currentData.actions || []).filter(
        (a: any) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d'
      );
      const totalMessages = messagingActions.reduce(
        (sum: number, a: any) => sum + parseInt(a.value, 10),
        0
      );
      const costPerMessage = totalMessages > 0 ? spend / totalMessages : 0;

      // Previous period insights
      const prevRes = await axios.get(
        `https://graph.facebook.com/v20.0/${adAccountId}/insights`,
        {
          params: {
            access_token: accessToken,
            fields: 'actions,spend',
            date_preset: 'last_month'
          }
        }
      );
      const prevData = prevRes.data.data[0] || { actions: [], spend: '0' };
      const prevSpend = parseFloat(prevData.spend);
      const prevMessagingActions = (prevData.actions || []).filter(
        (a: any) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d'
      );
      const prevTotalMessages = prevMessagingActions.reduce(
        (sum: number, a: any) => sum + parseInt(a.value, 10),
        0
      );
      const prevCostPerMessage = prevTotalMessages > 0 ? prevSpend / prevTotalMessages : 0;

      const diff = prevCostPerMessage > 0
        ? ((costPerMessage - prevCostPerMessage) / prevCostPerMessage) * 100
        : 0;
      const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(costPerMessage);

      setCostData({ value: formatted, diff: Math.abs(diff), trend });
    } catch {
      setCostData(prev => ({ ...prev, value: 'Error' }));
    }
  };

  useEffect(() => {
    if (startDate && endDate) fetchTotalCostPerMessage();
  }, [startDate, endDate]);

  return <TotalCostPerMessage {...costData} />;
};

export default TotalCostPerMessageContainer;
