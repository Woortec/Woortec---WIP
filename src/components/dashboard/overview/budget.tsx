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

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
  PHP: '₱',
  // Add more currency codes and symbols as needed
};

const getCurrencySymbol = (currencyCode: string): string => {
  return currencySymbols[currencyCode] || currencyCode;
};

export interface BudgetProps {
  sx?: SxProps;
}

export function Budget({ sx }: BudgetProps): React.JSX.Element {
  const [value, setValue] = useState('Loading...');
  const [currency, setCurrency] = useState('$');
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      const accessToken = localStorage.getItem('fbAccessToken');
      const userID = localStorage.getItem('fbUserID');

      if (!accessToken || !userID) {
        console.error('No access token or user ID found in local storage');
        setValue('Error');
        return;
      }

      try {
        const response = await axios.get(`https://graph.facebook.com/v19.0/${userID}/adaccounts`, {
          params: {
            access_token: accessToken,
            fields: 'id,account_id,currency',
          },
        });

        console.log('Ad Account Response:', response.data);

        if (!response.data.data || response.data.data.length === 0) {
          console.error('No ad accounts found');
          setValue('Error');
          return;
        }

        const adAccounts = response.data.data;
        let foundSpendData = false;

        for (const account of adAccounts) {
          const adAccountID = account.id;
          const accountCurrency = account.currency;

          try {
            const budgetResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountID}/insights`, {
              params: {
                access_token: accessToken,
                fields: 'spend',
                date_preset: 'last_30d',
              },
            });

            if (budgetResponse.data.data && budgetResponse.data.data.length > 0 && budgetResponse.data.data[0].spend) {
              const spendData = budgetResponse.data.data[0].spend;
              setValue(`${spendData}`);
              setCurrency(accountCurrency);
              setDiff(10); // Placeholder for percentage difference
              setTrend('up'); // Placeholder for trend
              foundSpendData = true;
              break;
            }
          } catch (error) {
            console.error(`Error fetching budget data for account ${adAccountID}`, error);
          }
        }

        if (!foundSpendData) {
          console.error('No spend data found');
          setValue('Error');
        }
      } catch (error) {
        console.error('Error fetching ad accounts', error);
        setValue('Error');
      }
    };

    fetchBudget();
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Budget
              </Typography>
              <Typography variant="h4">{currencySymbol}{value}</Typography>
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