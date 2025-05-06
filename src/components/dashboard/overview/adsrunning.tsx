// src/components/TotalAdsContainer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowUDownRight as RunningIcon } from '@phosphor-icons/react';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import axios from 'axios';
import { useDate } from './date/DateContext';
import type { SxProps } from '@mui/system';
import { createClient } from '../../../../utils/supabase/client';
import { makeBatchRequest } from './apiBatchRequest';

export interface TotalAdsProps {
  sx?: SxProps;
  value: string;
}

export function TotalAds({ value, sx }: TotalAdsProps): React.JSX.Element {
  return (
    <Card
      sx={{
        height: '10.7rem',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: '#D3346E', width: 40, height: 40 }}>
          <RunningIcon size={20} style={{ color: '#fff' }} />
        </Avatar>
        <Box sx={{ display: 'flex', gap: 1, bgcolor: '#F2F4F5', borderRadius: 2, p: 0.5 }}>
          <IconButton size="small">
            <LikeIcon size={18} />
          </IconButton>
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          ADS RUNNING
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mt: 0.5,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
          }}
        >
          {value}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" spacing={1}>
        {/* Since this is static in your example, we leave it hardcoded */}
        <Typography variant="body2" sx={{ fontSize: '0.9rem', color: 'red' }}>
          ↓ 52.67%
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Last month
        </Typography>
      </Stack>
    </Card>
  );
}

const TotalAdsContainer = () => {
  const { startDate, endDate } = useDate();
  const [adsData, setAdsData] = useState('Loading...');

  // Retry helper for rate-limit errors
  const safeBatch = async (params: Parameters<typeof makeBatchRequest>[0]) => {
    let attempts = 0;
    while (attempts < 3) {
      try {
        return await makeBatchRequest(params);
      } catch (err: any) {
        const isRateLimit =
          err.response?.data?.error?.code === 613 ||
          err.response?.data?.error?.message?.includes('rate limit');
        if (!isRateLimit) throw err;
        attempts += 1;
        await new Promise((r) => setTimeout(r, 1000 * attempts));
      }
    }
    throw new Error('Rate limit exceeded after retries');
  };

  useEffect(() => {
    const fetchTotalAds = async () => {
      try {
        const supabase = createClient();
        const userId = localStorage.getItem('userid');
        if (!userId) throw new Error('User ID is missing.');

        const { data, error } = await supabase
          .from('facebookData')
          .select('access_token, account_id')
          .eq('user_id', userId)
          .single();
        if (error || !data) throw new Error('Error fetching credentials.');

        const { access_token: accessToken, account_id: adAccountId } = data;
        if (!accessToken || !adAccountId) throw new Error('Missing credentials.');

        if (!startDate || !endDate) return;

        // Perform the batch request with retries
        const batch = await safeBatch({
          accessToken,
          adAccountId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });

        // batch[1] is our ads list
        const adsBody = JSON.parse(batch[1].body);
        const allAds = adsBody.data || [];
        const activeCount = allAds.filter((ad: any) => ad.effective_status === 'ACTIVE').length;

        setAdsData(`${activeCount} Active ads`);
      } catch (err) {
        console.error('Error fetching total ads data:', err);
        setAdsData('Error loading ads');
      }
    };

    fetchTotalAds();
  }, [startDate, endDate]);

  return <TotalAds value={adsData} />;
};

export default TotalAdsContainer;
