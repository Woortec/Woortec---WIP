import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import axios from 'axios';

export interface TasksProgressProps {
  sx?: SxProps;
}

export function TasksProgress({ sx }: TasksProgressProps): React.JSX.Element {
  const [value, setValue] = React.useState<number | string>(0);

  React.useEffect(() => {
    const fetchClicks = async () => {
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

        const adAccountID = response.data.data[0].id;

        const clicksResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountID}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'clicks',
            date_preset: 'lifetime',
          },
        });

        const totalClicks = clicksResponse.data.data.reduce((acc: number, item: any) => acc + parseInt(item.clicks, 10), 0);

        setValue(totalClicks);
      } catch (error) {
        console.error('Error fetching clicks:', error);
        setValue('Error');
      }
    };

    fetchClicks();
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Total Clicks
              </Typography>
              <Typography variant="h4">{typeof value === 'number' ? `${value}%` : value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px' }}>
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <div>
            <LinearProgress value={typeof value === 'number' ? value : 0} variant="determinate" />
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
