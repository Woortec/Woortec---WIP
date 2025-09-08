'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Divider, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react';
import { ArrowElbowRight as ArrowRightIcon } from '@phosphor-icons/react';
import { Bar } from 'react-chartjs-2';
import { useAdSpendData } from '@/contexts/DashboardDataContext';
import dayjs from 'dayjs';
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
import styles from './date/style/AdsSpend.module.css';
import { useLocale } from '@/contexts/LocaleContext';


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
  const { t } = useLocale();
  //List of Heights
  const isMobile = useMediaQuery('(max-width:600px)');
  const isLarge = useMediaQuery('(max-width:1570px)');

  const getHeight = () => {
    const windowHeight = window.innerHeight;
    if (windowHeight <= 1080) {
      return 400; // When height is less than or equal to 1080px
    } else if (windowHeight <= 1050){
      return 350; // When height is less than or equal to 1080px
    }
    return 1080; // Default height
  };

  const getChartHeight = () => {
    const windowHeight = window.innerHeight;
    if (windowHeight <= 1080) {
      return 130; // When height is less than or equal to 1080px
    } else if (windowHeight <= 1050){
      return 110; // When height is less than or equal to 1080px
    }
    return 800; // Default height
  };
  
  

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

  const { data: adSpendData, loading: dataLoading, error, refetch } = useAdSpendData();

  useEffect(() => {
    if (adSpendData) {
      console.log('Ad Spend Chart Data:', adSpendData);
      // Ensure the chart data has the correct styling
      const updatedChartData = {
        ...adSpendData,
        datasets: adSpendData.datasets.map(dataset => ({
          ...dataset,
          borderWidth: 0,
          backgroundColor: '#486A75',
          borderColor: '#486A75',
        }))
      };
      setChartData(updatedChartData);
    }
  }, [adSpendData]);

  useEffect(() => {
    setLoading(dataLoading);
  }, [dataLoading]);

  console.log('timeRange:', timeRange);

  return (
    <Card className={styles.mainContainer} sx={{
      borderRadius: '20px', backgroundColor:'white', flexDirection: 'column',}}>
      <CardHeader sx={{color:'#404D54'}}
        title={t('DashboardCharts.adSpend')}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
            onClick={() => refetch()}
          >
            {t('DashboardCharts.sync')}
          </Button>
        }
      />
 <CardContent>
  {loading ? (
    <CircularProgress />
  ) : (
<CardContent>
  {loading ? (
    <CircularProgress />
  ) : (
    <Box className={styles.Container}>
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
          elements: {
            bar: {
              borderWidth: 0,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: getFormattedDateRange(startDate, endDate),
                padding: { top: 50 },
                font: { size: 14 },
              },
              ticks: {
                font: { size: isMobile ? 9 : 14 },
                maxRotation: 0,
                minRotation: 0,
              },
            },
            y: {
              title: { display: true },
              beginAtZero: true,
            },
          },
        }}
      
      />
    </Box>
  )}
</CardContent>

  )}
</CardContent>

      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button sx={{color:'#486A75'}} startIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" color='#486A75' />} size="small">
          {t('DashboardCharts.overview')}
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