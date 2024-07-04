import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';
import axios from 'axios';

export interface TotalProfitProps {
  sx?: SxProps;
  value: string;
}

export function TotalProfit({ value, sx }: TotalProfitProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Profit
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function FetchAndDisplayTotalProfit({ sx }: { sx?: SxProps }): React.JSX.Element {
  const [cpc, setCpc] = React.useState<string>('Loading...');

  React.useEffect(() => {
    const fetchCPC = async () => {
      const accessToken = localStorage.getItem('fbAccessToken');
      const userID = localStorage.getItem('fbUserID');

      if (!accessToken || !userID) {
        console.error('No access token or user ID found in local storage');
        setCpc('Error');
        return;
      }

      try {
        const response = await axios.get(`https://graph.facebook.com/v19.0/${userID}/adaccounts`, {
          params: {
            access_token: accessToken,
          },
        });

        const adAccounts = response.data.data;

        for (const account of adAccounts) {
          try {
            const cpcResponse = await axios.get(`https://graph.facebook.com/v19.0/${account.id}/insights`, {
              params: {
                access_token: accessToken,
                fields: 'cpc',
                date_preset: 'lifetime',
              },
            });

            const cpcValue = cpcResponse.data.data[0]?.cpc;

            if (cpcValue) {
              setCpc(`$${parseFloat(cpcValue).toFixed(2)}`);
              return; // Exit loop once valid CPC value is found
            }
          } catch (error) {
            console.error(`Error fetching CPC for account ${account.id}:`, error);
          }
        }

        // If no valid CPC value is found
        setCpc('No data');
      } catch (error) {
        console.error('Error fetching ad accounts:', error);
        setCpc('Error');
      }
    };

    fetchCPC();
  }, []);

  return <TotalProfit sx={sx} value={cpc} />;
}
