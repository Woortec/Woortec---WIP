// src/components/TotalAdsContainer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowUDownRight as RunningIcon } from '@phosphor-icons/react';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';
import { ThumbsDown as DislikeIcon } from '@phosphor-icons/react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useDate } from './date/DateContext';
import type { SxProps } from '@mui/system';
import { useAdsRunningData } from '@/contexts/DashboardDataContext';
import { useLocale } from '@/contexts/LocaleContext';
import { CircularProgress } from '@mui/material';

export interface TotalAdsProps {
  sx?: SxProps;
  value: string;
  timeRange?: string;
  diff?: number;
  trend?: 'up' | 'down';
}

export function TotalAds({ value, sx, timeRange, diff, trend }: TotalAdsProps): React.JSX.Element {
  const { t } = useLocale();
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
          <IconButton size="small" sx={{ transform: 'scaleX(-1)' }}>
            <DislikeIcon size={18} />
          </IconButton>
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {t('DashboardCards.adsRunning')}
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
        <Typography variant="body2" sx={{ fontSize: '0.9rem', color: trend === 'up' ? 'green' : 'red' }}>
          {trend === 'up' ? '↑' : '↓'} {diff ? diff.toFixed(2) : '72.21'}%
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
         {timeRange === 'thisYear' ? 'Last year' : t('DashboardCards.lastMonth')}
        </Typography>
      </Stack>
    </Card>
  );
}

interface TotalAdsContainerProps {
  timeRange?: string;
}

const TotalAdsContainer = ({ timeRange }: TotalAdsContainerProps) => {
  const { data: adsRunningData, loading, error } = useAdsRunningData();

  if (loading) {
    return <TotalAds value="Loading..." timeRange={timeRange} diff={0} trend="up" />;
  }

  // Show fallback data even if there's an error (rate limit handling)
  if (adsRunningData) {
    return <TotalAds value={adsRunningData.value} timeRange={timeRange} diff={adsRunningData.diff} trend={adsRunningData.trend} />;
  }

  return <TotalAds value="No data available" timeRange={timeRange} diff={0} trend="up" />;
};

export default TotalAdsContainer;
