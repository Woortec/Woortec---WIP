import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { config } from '@/config';
import BudgetContainer from '@/components/dashboard/overview/budget';
import { Sales } from '@/components/dashboard/overview/adspend';
import TotalCostPerMessageContainer from '@/components/dashboard/overview/cpm';
import TotalImpressionsContainer from '@/components/dashboard/overview/impressions';
import TotalProfitContainer from '@/components/dashboard/overview/adsrunning';
import { TotalReach } from '@/components/dashboard/overview/reach';
import './styles.css'; // Import your CSS file

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` };

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={2}>
      <Grid lg={3} sm={6} xs={12}>
        <BudgetContainer/>
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalImpressionsContainer/>
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCostPerMessageContainer/>
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfitContainer/>
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales sx={{ height: '570px' }} /> {/* Inline style */}
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <TotalReach sx={{ height: '570px' }} /> {/* Inline style */}
      </Grid>
    </Grid>
  );
}
