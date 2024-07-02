import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import axios from 'axios';

export interface TotalImpressionsProps {
  sx?: SxProps;
}

export function TotalImpressions({ sx }: TotalImpressionsProps): React.JSX.Element {
  const [value, setValue] = useState('Loading...');
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const fetchImpressions = async () => {
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
          },
        });

        console.log('Ad Account Response:', response.data);

        if (!response.data.data || response.data.data.length === 0) {
          console.error('No ad accounts found');
          setValue('Error');
          return;
        }

        const adAccounts = response.data.data;
        let foundImpressionsData = false;

        for (const account of adAccounts) {
          const adAccountID = account.id;

          try {
            const currentPeriodResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountID}/insights`, {
              params: {
                access_token: accessToken,
                fields: 'impressions',
                date_preset: 'last_30d',
              },
            });

            const previousPeriodResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountID}/insights`, {
              params: {
                access_token: accessToken,
                fields: 'impressions',
                date_preset: 'previous_period',
              },
            });

            console.log(`Impressions Response for Account ${adAccountID}:`, currentPeriodResponse.data, previousPeriodResponse.data);

            if (
              currentPeriodResponse.data.data &&
              currentPeriodResponse.data.data.length > 0 &&
              currentPeriodResponse.data.data[0].impressions &&
              previousPeriodResponse.data.data &&
              previousPeriodResponse.data.data.length > 0 &&
              previousPeriodResponse.data.data[0].impressions
            ) {
              const currentImpressions = currentPeriodResponse.data.data[0].impressions;
              const previousImpressions = previousPeriodResponse.data.data[0].impressions;
              setValue(currentImpressions);

              const difference = currentImpressions - previousImpressions;
              const percentageChange = ((difference / previousImpressions) * 100).toFixed(2);
              setDiff(Number(percentageChange));
              setTrend(difference >= 0 ? 'up' : 'down');
              foundImpressionsData = true;
              break;
            }
          } catch (error) {
            console.error(`Error fetching impressions data for account ${adAccountID}`, error);
          }
        }

        if (!foundImpressionsData) {
          console.error('No impressions data found');
          setValue('Error');
        }
      } catch (error) {
        console.error('Error fetching ad accounts', error);
        setValue('Error');
      }
    };

    fetchImpressions();
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Impressions
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <EyeIcon fontSize="var(--icon-fontSize-lg)" />
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
