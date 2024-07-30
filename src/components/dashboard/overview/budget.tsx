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
    <Card sx={{ ...sx, padding: '16px', borderRadius: '8px' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }} spacing={2}>
            <Avatar sx={{ backgroundColor: '#00c853', height: '40px', width: '40px' }}>
              <CurrencyDollarIcon fontSize="24px" />
            </Avatar>
            <Stack direction="row" spacing={1}>
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendIcon color={trendColor} fontSize="20px" />

              </Typography>
              <Typography variant="body2" color="text.secondary">
                Since last month
              </Typography>
            </Stack>
          </Stack>
          <Typography variant="h5">{value}</Typography>
          <Typography color="text.secondary" variant="caption">
            BUDGET
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

const BudgetContainer = () => {
  const [budgetData, setBudgetData] = useState<{ value: string; diff: number; trend: 'up' | 'down'; currency: string }>({
    value: '',
    diff: 0,
    trend: 'up',
    currency: 'USD',
  });

  useEffect(() => {
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

        console.log('Access Token:', accessToken);
        console.log('Ad Account ID:', adAccountId);

        // Fetch the ad account details to get the currency
        const accountDetailsResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}`, {
          params: {
            access_token: accessToken,
            fields: 'currency',
          },
        });

        const currency = accountDetailsResponse.data.currency;

        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'spend',
            date_preset: 'last_30d',
          },
        });

        console.log('Response data:', response.data);

        if (!response.data.data || response.data.data.length === 0) {
          throw new Error('No data found for the given time period');
        }

        const spend = parseFloat(response.data.data[0].spend);

        const previousResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'spend',
            date_preset: 'last_month',
          },
        });

        console.log('Previous response data:', previousResponse.data);

        if (!previousResponse.data.data || previousResponse.data.data.length === 0) {
          throw new Error('No data found for the previous time period');
        }

        const previousSpend = parseFloat(previousResponse.data.data[0].spend);

        const diff = ((spend - previousSpend) / previousSpend) * 100;
        const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';

        const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(spend);

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

    fetchBudget();
  }, []);

  return <Budget {...budgetData} />;
};

export default BudgetContainer;

// Utility function to get item from localStorage with expiry
function getItemWithExpiry(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  // If the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    // Compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage and return null
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Error parsing item from localStorage', error);
    return null;
  }
}
