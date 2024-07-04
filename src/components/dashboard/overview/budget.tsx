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
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Budget
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
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

const BudgetContainer = () => {
  const [budgetData, setBudgetData] = useState<{ value: string; diff: number; trend: 'up' | 'down' }>({
    value: '',
    diff: 0,
    trend: 'up',
  });

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const accessToken = localStorage.getItem('fbAccessToken');
        const adAccountId = localStorage.getItem('fbAdAccount');

        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'spend',
            date_preset: 'last_30d',
          },
        });

        const spend = parseFloat(response.data.data[0].spend);
        const previousResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'spend',
            date_preset: 'last_60d',
          },
        });

        const previousSpend = parseFloat(previousResponse.data.data[0].spend) / 2; // Divide by 2 for the previous 30 days

        const diff = ((spend - previousSpend) / previousSpend) * 100;
        const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';

        setBudgetData({
          value: `$${spend.toFixed(2)}`,
          diff: Math.abs(diff),
          trend: trend,
        });
      } catch (error) {
        console.error('Error fetching budget data:', error);
      }
    };

    fetchBudget();
  }, []);

  return <Budget {...budgetData} />;
};

export default BudgetContainer;
