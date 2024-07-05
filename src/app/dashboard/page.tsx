import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import BudgetContainer from '@/components/dashboard/overview/budget'; // Use default import for BudgetContainer
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import TotalCostPerMessageContainer  from '@/components/dashboard/overview/tasks-progress';
import TotalImpressionsContainer from '@/components/dashboard/overview/total-customers'; // Adjusted import statement
import  TotalProfitContainer  from '@/components/dashboard/overview/total-profit';
import { FollowersByCountry } from '@/components/dashboard/overview/traffic';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <BudgetContainer />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>  
        <TotalImpressionsContainer />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCostPerMessageContainer/>
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfitContainer />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <FollowersByCountry />
      </Grid>
    </Grid>
  );
}
