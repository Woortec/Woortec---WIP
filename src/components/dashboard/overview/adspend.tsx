'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Divider, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react';
import { ArrowElbowRight as ArrowRightIcon } from '@phosphor-icons/react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import dayjs from 'dayjs';
import { createClient } from '../../../../utils/supabase/client'; // Make sure the path to your Supabase client is correct
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useMediaQuery } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesProps {
  timeRange: string;
  startDate: Date | null;
  endDate: Date | null;
  sx?: SxProps;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    barThickness: number;
    borderWidth?: number; // Add borderWidth as an optional property
    borderRadius?: number;
  }[];
}

const getFormattedDate = (date: Date | null): string => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '';
};

export function Sales({ sx, startDate, endDate, timeRange }: SalesProps): React.JSX.Element {
  const isMobile = useMediaQuery('(max-width:600px)');
  const isLarge = useMediaQuery('(max-width:1570px)');
  const theme = useTheme();
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getFormattedDateRange = (startDate: Date | null, endDate: Date | null): string => {
    if (startDate && endDate) {
      return `${dayjs(startDate).format('MMM DD, YYYY')} - ${dayjs(endDate).format('MMM DD, YYYY')}`;
    }
    return '';
  };

  const fetchAdSpendData = async () => {
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

      if (!accessToken) {
        throw new Error('Missing access token from Supabase.');
      }

      if (!adAccountId) {
        throw new Error('Missing ad account ID from Supabase.');
      }

      let timeIncrement = '1';
      let labelFormat = 'ddd, DD MMM'; // Default to daily format

      const start = dayjs(startDate);
      const end = dayjs(); // Set end date to today if the time range is 'This Month'
      const monthDifference = end.diff(start, 'month');

      if (monthDifference >= 2) {
        timeIncrement = 'monthly'; // Use monthly aggregation if the difference is 2 months or more
        labelFormat = 'MMM'; // Format to show short month names like "Jan", "Feb", etc.
      } else if (monthDifference >= 1){
        labelFormat = 'DD';
      } else if (monthDifference >= 0){
        labelFormat = 'ddd, DD';
      } 

      // Log the start and end date to make sure they are correct
      console.log(`Fetching data from ${getFormattedDate(start.toDate())} to ${getFormattedDate(end.toDate())}`);

      const response = await axios.get(`https://graph.facebook.com/v21.0/${adAccountId}/insights`, {
        params: {
          access_token: accessToken,
          fields: 'spend,date_start',
          time_range: JSON.stringify({
            since: getFormattedDate(startDate),
            until: getFormattedDate(end.toDate()), // Ensure we fetch data until today's date
          }),
          time_increment: timeIncrement,
          limit: 50, // Adjust time increment based on date range
        },
      });

      console.log('Raw Response Data:', response.data);

      if (response.data.data && response.data.data.length > 0) {
        const labels: string[] = [];
        const data: number[] = [];

        if (timeIncrement === 'monthly') {
          // Handle data with monthly aggregation
          const monthlyData = new Array(12).fill(0); // Initialize array to store spend data for each month

          response.data.data.forEach((item: any) => {
            const month = dayjs(item.date_start).month(); // Get month index (0-11)
            monthlyData[month] += parseFloat(item.spend); // Accumulate spend for each month
          });

          labels.push(...shortMonths); // Add short month names to labels
          data.push(...monthlyData); // Add monthly spend data to the chart
        } else {
          // Handle daily data or other increments
          let currentDate = start;

          while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
            const formattedDate = currentDate.format(labelFormat);
            labels.push(formattedDate);

            const matchingDay = response.data.data.find((item: any) =>
              dayjs(item.date_start).isSame(currentDate, 'day')
            );

            data.push(matchingDay ? parseFloat(matchingDay.spend) : 0);
            currentDate = currentDate.add(1, 'day');
          }
        }

        const formattedData: ChartData = {
          labels,
          datasets: [{
            label: 'Ad Spend',
            data,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 2, 
            backgroundColor: '#486A75',
            fill: true,
            barThickness: isMobile ? 10 : (timeRange === 'month' ? 10 : 40),
          }],
        };
        
        setChartData(formattedData);
      } else {
        console.log('No data found in the response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching ad spend data:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Effect triggered with:", { startDate, endDate, timeRange });
    fetchAdSpendData();
  }, [startDate, endDate, timeRange]);

  console.log('timeRange:', timeRange);

  return (
    <Card sx={{ height:'100%', borderRadius: '20px', backgroundColor:'white', display:'flex', flexDirection: 'column'}}>
      <CardHeader sx={{color:'#404D54'}}
        title="Ad Spend"
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
            onClick={() => fetchAdSpendData()}
          >
            Sync
          </Button>
        }
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  title: {
                    display: true, 
                    text: getFormattedDateRange(startDate, endDate),
                    padding: {
                    top: 50, 
                    },
                    font: {
                      size: 14,
                    },
                  },
                  ticks: {
                    font: {
                      size: isMobile ? 9 : 14, // Smaller font for mobile
                    },
                      // Set rotation to 0 to avoid slanted labels
                      maxRotation: 0,
                      minRotation: 0,
                  },
                },
                y: {
                  title: {
                    display: true,
                  },
                  beginAtZero: true,
                },
              },
            }}
            height={ isLarge ? 200 : 890 }
          />
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button sx={{color:'#486A75'}} startIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" color='#486A75' />} size="small">
          Overview
        </Button>
      </CardActions>
    </Card>
  );
}

// Utility function to get item from localStorage with expiry
function getItemWithExpiry(key: string): string | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Error parsing item from localStorage', error);
    return null;
  }
}