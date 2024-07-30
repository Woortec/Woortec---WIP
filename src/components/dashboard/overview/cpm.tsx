'use client';

import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon, ListBullets as ListBulletsIcon } from '@phosphor-icons/react';
import axios from 'axios';

export interface TotalCostPerMessageProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}

export function TotalCostPerMessage({ diff, trend, sx, value }: TotalCostPerMessageProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ ...sx, height: '170px', overflow: 'hidden' }}> {/* Setting a fixed height */}
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Cost per Message
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
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

const TotalCostPerMessageContainer = () => {
  const [costData, setCostData] = useState<{ value: string; diff: number; trend: 'up' | 'down' }>({
    value: '',
    diff: 0,
    trend: 'up',
  });

  useEffect(() => {
    const fetchTotalCostPerMessage = async () => {
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

        // Fetch the total cost per messaging conversation for the Facebook ad account
        const response = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'cost_per_action_type',
            date_preset: 'last_30d',
          },
        });

        console.log('Response data:', response.data);

        const actions = response.data.data[0]?.actions || [];
        const totalCostPerMessage = actions
          .filter((action: any) => action.action_type === 'onsite_conversion.messaging_conversation_started_7d')
          .reduce((sum: number, action: any) => sum + parseFloat(action.value), 0);

        // Fetch the previous total cost per messaging conversation for the comparison
        const previousResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'cost_per_action_type',
            date_preset: 'last_month',
          },
        });

        console.log('Previous response data:', previousResponse.data);

        const previousActions = previousResponse.data.data[0]?.actions || [];
        const previousCostPerMessage = previousActions
          .filter((action: any) => action.action_type === 'onsite_conversion.messaging_conversation_started_7d')
          .reduce((sum: number, action: any) => sum + parseFloat(action.value), 0);

        const diff = ((totalCostPerMessage - previousCostPerMessage) / previousCostPerMessage) * 100;
        const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';

        setCostData({
          value: `$${totalCostPerMessage.toFixed(2)}`,
          diff: Math.abs(diff),
          trend: trend,
        });
      } catch (error) {
        console.error('Error fetching total cost per message data:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    };

    fetchTotalCostPerMessage();
  }, []);

  return <TotalCostPerMessage {...costData} />;
};

export default TotalCostPerMessageContainer;

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
