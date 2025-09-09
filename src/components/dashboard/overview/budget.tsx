
'use client';
import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import type { SxProps } from '@mui/system';
import { useBudgetData } from '@/contexts/DashboardDataContext';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';
import { ThumbsDown as DislikeIcon } from '@phosphor-icons/react';
import { Tooltip } from 'react-bootstrap';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useLocale } from '@/contexts/LocaleContext';

export interface BudgetProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
  timeRange?: string;
  currency?: string;
}

export function Budget({ diff, trend, sx, value, timeRange, currency }: BudgetProps): React.JSX.Element {



  const { t } = useLocale();
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ height: '10.7rem', padding:'1rem' }}>
      <Box>
      
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Avatar sx={{ backgroundColor: '#02B194', height: '2rem', width: '2rem' }}>
            <CurrencyDollarIcon fontSize="1.5rem" style={{ color: 'white' }} />
          </Avatar>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '4.5rem', bgcolor: '#F2F4F5', borderRadius: '20px' }}>
            <IconButton><LikeIcon size="1.2rem" /></IconButton>
            <IconButton sx={{ transform: 'scaleX(-1)' }}><DislikeIcon size="1.2rem" /></IconButton>
          </Box>
        </Box>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Stack>
              <Typography sx={{paddingTop:'0.7rem', fontSize:'0.7rem'}} color="text.secondary"> {t('DashboardCards.budget')}</Typography>
              <Typography variant="h4" sx={{paddingBottom:'0.7rem', fontSize:'1.5rem', fontWeight:'600'}}>
                {value === '' ? 'data not found' : `${value} ${currency || 'EUR'}`}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ fontSize: '0.9rem', color: trendColor }}>
              {trend === 'up' ? '↑' : '↓'} {diff ? diff.toFixed(2) : '29.76%'}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {timeRange === 'thisYear' ? 'Last year' : t('DashboardCards.lastMonth')}
            </Typography>
          </Stack>
      </Box>
    </Card>
  );
}

interface BudgetContainerProps {
  timeRange?: string;
}

const BudgetContainer = ({ timeRange }: BudgetContainerProps) => {
  const { data: budgetData, loading, error } = useBudgetData();

  if (loading) {
    return <Budget value="Loading..." diff={0} trend="up" sx={{ height: '150px' }} timeRange={timeRange} currency="EUR" />;
  }

  // Show fallback data even if there's an error (rate limit handling)
  if (budgetData) {
    return <Budget {...budgetData} sx={{ height: '150px' }} timeRange={timeRange} currency={budgetData.currency} />;
  }

  return <Budget value="No data available" diff={0} trend="up" sx={{ height: '150px' }} timeRange={timeRange} currency="EUR" />;
};

export default BudgetContainer;

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