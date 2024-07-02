'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import axios from 'axios';

export interface BudgetProps {
  sx?: SxProps;
}

export function Budget({ sx }: BudgetProps): React.JSX.Element {
  const [value, setValue] = useState('Loading...');
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      const accessToken = localStorage.getItem('fbAccessToken');
      const userID = localStorage.getItem('fbUserID');

      if (!accessToken || !userID) {
        console.error('No access token or user ID found in local storage');
        return;
      }

      try {
        const response = await axios.get(`https://graph.facebook.com/v12.0/${userID}/adaccounts`, {
          params: {
            access_token: accessToken,
          },
        });

        const adAccountID = response.data.data[0].id;

        const budgetResponse = await axios.get(`https://graph.facebook.com/v12.0/${adAccountID}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'spend',
            date_preset: 'last_30d',
          },
        });

        const spendData = budgetResponse.data.data[0].spend;
        setValue(`$${spendData}`);
        // Set diff and trend based on actual data (Placeholder logic here)
        setDiff(10); // Placeholder for percentage difference
        setTrend('up'); // Placeholder for trend
      } catch (error) {
        console.error('Error fetching budget data', error);
        setValue('Error');
      }
    };

    fetchBudget();
  }, []);

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
          {diff !== null && (
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
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
