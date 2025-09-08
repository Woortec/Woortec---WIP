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
import { useImpressionsData } from '@/contexts/DashboardDataContext';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';
import { useLocale } from '@/contexts/LocaleContext';

export interface TotalImpressionsProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
  timeRange?: string;
}

export function TotalImpressions({ diff, trend, sx, value, timeRange }: TotalImpressionsProps): React.JSX.Element {
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ fontSize: '0.9rem', color: trendColor }}>
              {trend === 'up' ? '↑' : '↓'} {diff ? diff.toFixed(2) : '16.66'}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {timeRange === 'thisYear' ? 'Last year' : t('DashboardCards.lastMonth')}
            </Typography>
          </Stack>
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
  timeRange?: string;
}

const TotalImpressionsContainer = ({ timeRange }: TotalImpressionsContainerProps) => {
  const { data: impressionsData, loading, error } = useImpressionsData();

  if (loading) {
    return <TotalImpressions value="Loading..." diff={0} trend="up" timeRange={timeRange} />;
  }

  // Show fallback data even if there's an error (rate limit handling)
  if (impressionsData) {
    return <TotalImpressions {...impressionsData} timeRange={timeRange} />;
  }

  return <TotalImpressions value="No data available" diff={0} trend="up" timeRange={timeRange} />;
};

export default TotalImpressionsContainer;