'use client';

import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react';
import { Globe as GlobeIcon } from '@phosphor-icons/react';
import axios from 'axios';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

const iconMapping = { Globe: GlobeIcon } as Record<string, Icon>;

export interface FollowersByCountryProps {
  sx?: SxProps;
}

export function FollowersByCountry({ sx }: FollowersByCountryProps): React.JSX.Element {
  const [chartSeries, setChartSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const chartOptions = useChartOptions(labels);

  useEffect(() => {
    const fetchFollowersByCountry = async () => {
      try {
        const accessToken = getItemWithExpiry('fbAccessToken');
        const pageId = getItemWithExpiry('fbPageId');

        if (!accessToken) {
          throw new Error('Missing access token');
        }

        if (!pageId) {
          throw new Error('Missing page ID');
        }

        console.log('Access Token:', accessToken);
        console.log('Page ID:', pageId);

        // Fetch the followers by country for the Facebook page
        const response = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/insights`, {
          params: {
            access_token: accessToken,
            metric: 'page_fans_country',
            period: 'lifetime',
          },
        });

        console.log('Response data:', response.data);

        if (!response.data.data || response.data.data.length === 0) {
          throw new Error('No data found for the given page ID');
        }

        const countryData: Record<string, number> = response.data.data[0].values[0].value;
        const labels = Object.keys(countryData);
        const chartSeries = Object.values(countryData).map((value: number) => value);

        setLabels(labels);
        setChartSeries(chartSeries);
      } catch (error) {
        console.error('Error fetching followers by country data:', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    };

    fetchFollowersByCountry();
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Followers by Country" />
      <CardContent>
        <Stack spacing={2}>
          <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {chartSeries.map((item, index) => {
              const label = labels[index];
              const Icon = iconMapping['Globe'];

              return (
                <Stack key={label} spacing={1} sx={{ alignItems: 'center' }}>
                  {Icon ? <Icon fontSize="var(--icon-fontSize-lg)" /> : null}
                  <Typography variant="h6">{label}</Typography>
                  <Typography color="text.secondary" variant="subtitle2">
                    {item}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}

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
