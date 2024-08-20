'use client';

import React, { useState } from 'react';
import Grid from '@mui/material/Grid'; // Use stable Grid instead of Unstable_Grid2
import BudgetContainer from '@/components/dashboard/overview/budget';
import { Sales } from '@/components/dashboard/overview/adspend';
import TotalCostPerMessageContainer from '@/components/dashboard/overview/cpm';
import TotalImpressionsContainer from '@/components/dashboard/overview/impressions';
import TotalProfitContainer from '@/components/dashboard/overview/adsrunning';
import { TotalReach } from '@/components/dashboard/overview/reach';
import DatePickerComponent from '@/components/dashboard/overview/DateRangePicker';
import { DateProvider } from '@/components/dashboard/overview/date/DateContext';

export default function Page(): React.JSX.Element {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  return (
    <DateProvider>
      <Grid container spacing={2}>
        <Grid item lg={3} md={6} xs={12}>
          <BudgetContainer startDate={startDate} endDate={endDate} />
        </Grid>
        <Grid item lg={3} md={6} xs={12}>
          <TotalImpressionsContainer />
        </Grid>
        <Grid item lg={3} md={6} xs={12}>
          <TotalCostPerMessageContainer />
        </Grid>
        <Grid item lg={3} md={6} xs={12}>
          <TotalProfitContainer />
        </Grid>
        <Grid item lg={12} xs={12}>
          <DatePickerComponent
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </Grid>
        <Grid item lg={8} xs={12}>
          <Sales timeRange="custom" startDate={startDate} endDate={endDate} sx={{ height: '570px' }} />
        </Grid>
        <Grid item lg={4} md={6} xs={12}>
          <TotalReach sx={{ height: '570px' }} />
        </Grid>
      </Grid>
    </DateProvider>
  );
}
