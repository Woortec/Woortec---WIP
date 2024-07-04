'use client';

import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Clicks } from '@/components/dashboard/overview/sales'; // Updated import
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalImpressions } from '@/components/dashboard/overview/total-customers';
import { FetchAndDisplayTotalProfit } from '@/components/dashboard/overview/total-profit';
import { FetchAndDisplayTraffic } from '@/components/dashboard/overview/traffic'; // Updated import
import FacebookConnectButton from '@/components/FacebookConnectButton';

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <Budget sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalImpressions sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <FetchAndDisplayTotalProfit sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={8} xs={12}>
        <Clicks sx={{ height: '100%' }} /> {/* Updated component usage */}
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <FetchAndDisplayTraffic sx={{ height: '100%' }} /> {/* Updated component usage */}
      </Grid>
      <Grid lg={12} xs={12}>
        <FacebookConnectButton />
      </Grid>
    </Grid>
  );
}
