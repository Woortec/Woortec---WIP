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
import axios from 'axios';
import type { SxProps } from '@mui/system';
import dayjs from 'dayjs';

export interface BudgetProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}

export function Budget({ diff, trend, sx, value }: BudgetProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ ...sx, height: '170px', overflow: 'hidden' }}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Budget
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: '#02B194', height: '56px', width: '56px' }}>
              <CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" style={{ color: 'white' }} />
            </Avatar>
          </Stack>
          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff.toFixed(2)}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface BudgetContainerProps {
  startDate: Date | null;
  endDate: Date | null;
}

const BudgetContainer = ({ startDate, endDate }: BudgetContainerProps) => {
  const [budgetData, setBudgetData] = useState<{ value: string; diff: number; trend: 'up' | 'down'; currency: string }>({
    value: '',
    diff: 0,
    trend: 'up',
    currency: 'USD',
  });

  const fetchBudget = async () => {
    try {
      const accessToken = getItemWithExpiry('fbAccessToken');
      const adAccountId = getItemWithExpiry('fbAdAccount');

      if (!accessToken) {
        throw new Error('Missing access token');
      }

      if (!adAccountId) {
        throw new Error('Missing ad account ID');
      }

      // Fetch the ad account details to get the currency
      const accountDetailsResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}`, {
        params: {
          access_token: accessToken,
          fields: 'currency',
        },
      });

      const currency = accountDetailsResponse.data.currency;

      // Fetch the spend data for the given date range
      const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'spend',
          time_range: JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          }),
        },
      });

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('No data found for the given time period');
      }

      const spend = parseFloat(response.data.data.reduce((total: number, item: any) => total + parseFloat(item.spend), 0));

      const previousResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'spend',
          date_preset: 'last_month',
        },
      });

      if (!previousResponse.data.data || previousResponse.data.data.length === 0) {
        throw new Error('No data found for the previous time period');
      }

      const previousSpend = parseFloat(previousResponse.data.data[0].spend);

      const diff = ((spend - previousSpend) / previousSpend) * 100;
      const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';

      const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(spend);

      setBudgetData({
        value: formattedValue,
        diff: Math.abs(diff),
        trend: trend,
        currency: currency,
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [startDate, endDate]);

  return <Budget {...budgetData} sx={{ height: '150px' }} />;
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
