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
import { useCTRData } from '@/contexts/DashboardDataContext';

export interface CTRProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: any;
  value: string;
  timeRange?: string;
}

export function CTR({
  diff,
  trend,
  sx,
  value,
  timeRange
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
                  {value === '' ? 'data not found' : value}%
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontSize: '0.9rem', color: trendColor }}>
                {trend === 'up' ? '↑' : '↓'} {diff ? diff.toFixed(2) : '63.12'}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {timeRange === 'thisYear' ? 'Last year' : t('DashboardCards.lastMonth')}
              </Typography>
            </Stack>
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
  timeRange?: string;
}

const CTRContainer = ({ timeRange }: CTRContainerProps) => {
  const { data: ctrData, loading, error } = useCTRData();

  if (loading) {
    return <CTR value="Loading..." diff={0} trend="up" timeRange={timeRange} />;
  }

  // Show fallback data even if there's an error (rate limit handling)
  if (ctrData) {
    return <CTR {...ctrData} timeRange={timeRange} />;
  }

  return <CTR value="No data available" diff={0} trend="up" timeRange={timeRange} />;
};

export default CTRContainer;
