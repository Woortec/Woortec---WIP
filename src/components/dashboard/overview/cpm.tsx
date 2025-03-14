import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon } from '@phosphor-icons/react';
import axios from 'axios';
import { ChatText } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { createClient } from '../../../../utils/supabase/client'; // Adjust the path to your Supabase client
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { ThumbsUp as LikeIcon } from '@phosphor-icons/react';

export interface TotalCostPerMessageProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: any;
  value: string;
}

export function TotalCostPerMessage({ diff, trend, sx, value }: TotalCostPerMessageProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={{ height: '10.7rem'}}>
      <Box sx={{padding:'1rem'}}>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Avatar sx={{ backgroundColor: '#FFC456', height: '2rem', width: '2rem', }}>
              <ChatText fontSize="1.5rem" style={{ color: 'white' }} />
            </Avatar>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '2.3rem', bgcolor: '#F2F4F5', borderRadius: '20px' }}>
               <IconButton><LikeIcon size="1.2rem" /></IconButton>
             </Box>

        </Box>

        <Box sx={{display:'flex',}}>
          <Box sx={{width:'100%',}}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack>
              <Typography sx={{paddingTop:'0.7rem', fontSize:'0.7rem'}} color="text.secondary">CLICK THROUGH RATE
              </Typography>
              <Typography variant="h4" sx={{paddingBottom:'0.7rem', fontSize:'1.5rem', fontWeight:'600'}}>{value}</Typography>
            </Stack>
          </Stack>
          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} />
                <Typography color={trendColor} variant="body2" sx={{fontSize:'0.9rem'}}>
                  {diff.toFixed(2)}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption" sx={{fontSize:'0.7rem'}}>
                Last month
              </Typography>
            </Stack>
          ) : null}
          </Box>
          
          <Box sx={{width: '35%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ marginTop: 'auto',}}>
              <Box sx={{ color: '#859096', textAlign:'center'}}>0</Box>
              <Box sx={{ color: '#859096', fontSize: '0.5rem', textAlign:'center' }}>N Messages</Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </Card>
  );
}

interface TotalCostPerMessageContainerProps {
  startDate: Date | null;
  endDate: Date | null;
}

const TotalCostPerMessageContainer = ({ startDate, endDate }: TotalCostPerMessageContainerProps) => {
  const [costData, setCostData] = useState<{ value: string; diff: number; trend: 'up' | 'down' }>(
    {
      value: '',
      diff: 0,
      trend: 'up',
    }
  );

  const fetchTotalCostPerMessage = async () => {
    try {
      const supabase = createClient();
      const userId = localStorage.getItem('userid'); // Fetch the userId from localStorage (if applicable)

      if (!userId) {
        throw new Error('User ID is missing.');
      }

      // Fetch access token and ad account ID from Supabase
      const { data, error } = await supabase
        .from('facebookData')
        .select('access_token, account_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new Error('Error fetching data from Supabase.');
      }

      const { access_token: accessToken, account_id: adAccountId } = data;

      if (!accessToken || !adAccountId) {
        throw new Error('Missing access token or ad account ID');
      }

      // Fetch the currency of the ad account
      const accountDetailsResponse = await axios.get(`https://graph.facebook.com/v20.0/${adAccountId}`, {
        params: {
          access_token: accessToken,
          fields: 'currency',
        },
      });

      const currency = accountDetailsResponse.data.currency;
      console.log('Currency:', currency);

      // Fetch the total cost per messaging conversation started for the Facebook ad account
      const response = await axios.get(`https://graph.facebook.com/v20.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'actions,spend',
          time_range: JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          }),
        },
      });

      // Log the full response for debugging
      console.log('Response data:', response.data);

      // Extract actions and spend data
      const actions = response.data.data[0]?.actions || [];
      const spend = parseFloat(response.data.data[0]?.spend || '0');
      console.log('Spend:', spend);
      console.log('Actions:', actions);

      // Filter the action to only include 'onsite_conversion.messaging_conversation_started_7d'
      const messagingActions = actions.filter(
        (action: any) => action.action_type === 'onsite_conversion.messaging_conversation_started_7d'
      );
      console.log('Messaging Actions:', messagingActions);

      // Calculate the total cost per message
      const totalMessages = messagingActions.reduce(
        (sum: number, action: any) => sum + parseInt(action.value, 10),
        0
      );
      console.log('Total Messages:', totalMessages);

      // If there are no messages, avoid division by zero
      const costPerMessage = totalMessages > 0 ? spend / totalMessages : 0;
      console.log('Cost per Message:', costPerMessage);

      // Fetch the previous total cost per messaging conversation started for comparison
      const previousResponse = await axios.get(`https://graph.facebook.com/v20.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'actions,spend',
          date_preset: 'last_month',
        },
      });

      // Log the previous response for debugging
      console.log('Previous response data:', previousResponse.data);

      // Extract previous actions and spend data
      const previousActions = previousResponse.data.data[0]?.actions || [];
      const previousSpend = parseFloat(previousResponse.data.data[0]?.spend || '0');
      console.log('Previous Spend:', previousSpend);
      console.log('Previous Actions:', previousActions);

      // Filter the previous actions to only include 'onsite_conversion.messaging_conversation_started_7d'
      const previousMessagingActions = previousActions.filter(
        (action: any) => action.action_type === 'onsite_conversion.messaging_conversation_started_7d'
      );
      console.log('Previous Messaging Actions:', previousMessagingActions);

      // Calculate the previous total cost per message
      const previousTotalMessages = previousMessagingActions.reduce(
        (sum: number, action: any) => sum + parseInt(action.value, 10),
        0
      );
      console.log('Previous Total Messages:', previousTotalMessages);

      // If there are no previous messages, avoid division by zero
      const previousCostPerMessage = previousTotalMessages > 0 ? previousSpend / previousTotalMessages : 0;
      console.log('Previous Cost per Message:', previousCostPerMessage);

      // Calculate the difference percentage
      const diff = previousCostPerMessage > 0 ? ((costPerMessage - previousCostPerMessage) / previousCostPerMessage) * 100 : 0;
      const trend: 'up' | 'down' = diff >= 0 ? 'up' : 'down';
      console.log('Diff:', diff, 'Trend:', trend);

      // Format the cost per message with the correct currency
      const formattedCostPerMessage = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(costPerMessage);

      setCostData({
        value: formattedCostPerMessage,
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

  useEffect(() => {
    if (startDate && endDate) {
      fetchTotalCostPerMessage();
    }
  }, [startDate, endDate]);

  return <TotalCostPerMessage {...costData} />;
};

export default TotalCostPerMessageContainer;