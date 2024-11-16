'use client';

import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Box, SxProps } from '@mui/material';
import dayjs from 'dayjs';
import { createClient } from '../../../../utils/supabase/client'; // Adjust the path to your Supabase client

ChartJS.register(ArcElement, Tooltip, Legend);

export interface TotalReachProps {
  sx?: SxProps;
  startDate: Date | null;
  endDate: Date | null;
}

export function TotalReach({ sx, startDate, endDate }: TotalReachProps): React.JSX.Element {
  const [totalReach, setTotalReach] = useState<number>(0);
  const [clicks, setClicks] = useState<number>(0);
  const [messagesStarted, setMessagesStarted] = useState<number>(0);

  const [originalData, setOriginalData] = useState<number[]>([0, 0]); // Store the original values for toggling

  const [chartData, setChartData] = useState({
    labels: ['Clicks', 'Messages Started'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4BC0C0', '#364FC7'],
        hoverBackgroundColor: ['#4BC0C0', '#364FC7'],
        borderWidth: 0,
      },
    ],
  });

  const fetchTotalReach = async () => {
    try {
      const supabase = createClient();
      const userId = localStorage.getItem('userid'); // Fetch the userId from localStorage

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

      if (!accessToken) {
        throw new Error('Missing access token');
      }

      if (!adAccountId) {
        throw new Error('Missing ad account ID');
      }

      // Fetch the total reach, clicks, and messages started based on the user's selected date range
      const response = await axios.get(`https://graph.facebook.com/v21.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'impressions,clicks,actions',
          time_range: JSON.stringify({
            since: dayjs(startDate).format('YYYY-MM-DD'),
            until: dayjs(endDate).format('YYYY-MM-DD'),
          }),
        },
      });

      const reachData = response.data.data;

      if (!reachData || reachData.length === 0) {
        throw new Error('No data found for the given ad account ID');
      }

      // Process the response to get total impressions, clicks, and messages started
      const totalReach = reachData.reduce((sum: number, dataPoint: any) => sum + parseInt(dataPoint.impressions), 0);
      const totalClicks = reachData.reduce((sum: number, dataPoint: any) => sum + parseInt(dataPoint.clicks), 0);

      const totalMessagesStarted = reachData.reduce((sum: number, dataPoint: any) => {
        const messageAction = dataPoint.actions?.find(
          (action: any) => action.action_type === 'onsite_conversion.messaging_conversation_started_7d'
        );
        return sum + (messageAction ? parseInt(messageAction.value) : 0);
      }, 0);

      setTotalReach(totalReach);
      setClicks(totalClicks);
      setMessagesStarted(totalMessagesStarted);

      // Save original data for toggling visibility
      setOriginalData([totalClicks, totalMessagesStarted]);

      setChartData({
        labels: ['Clicks', 'Messages Started'],
        datasets: [
          {
            data: [totalClicks, totalMessagesStarted],
            backgroundColor: ['#486A75', '#E46A6A'],
            hoverBackgroundColor: ['#4BC0C0', '#CF366C'],
            borderWidth: 0,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching total reach data:', error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchTotalReach();
    }
  }, [startDate, endDate]);

  // Handle legend click to toggle between showing and hiding "Clicks" or "Messages Started"
  const handleLegendClick = (event: any, legendItem: any) => {
    const clickedIndex = legendItem.index;

    // Clone the current dataset data
    const newData = [0, 0];
    newData[clickedIndex] = chartData.datasets[0].data[clickedIndex];

    // Toggle between showing and hiding the data for the clicked legend item
    if (newData[clickedIndex] === 0) {
      // Restore the original value
      newData[clickedIndex] = originalData[clickedIndex];
    } else {
      // Hide by setting it to 0
      newData[clickedIndex] = 0;
    }

    // Update the chart data with the toggled values
    setChartData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: newData,
        },
      ],
    }));
  };

  // Format numbers using Intl.NumberFormat
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <Card sx={{ ...sx, height: '570px', overflow: 'hidden' }}>
      <CardHeader title="Total Reach" />
      <CardContent sx={{ position: 'relative' }}>
        <Stack spacing={2} alignItems="center">
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (tooltipItem) {
                        const value = tooltipItem.raw as number;
                        return `${tooltipItem.label}: ${new Intl.NumberFormat('en-US').format(value)}`;
                      },
                    },
                  },
                  legend: {
                    display: true,
                    position: 'top',
                    onClick: handleLegendClick,
                  },
                },
                cutout: '70%',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" component="div">{formatNumber(totalReach)}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Total Reach
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
