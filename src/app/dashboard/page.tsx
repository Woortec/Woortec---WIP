'use client';

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid'; // Use stable Grid instead of Unstable_Grid2
import BudgetContainer from '@/components/dashboard/overview/budget';
import { Sales } from '@/components/dashboard/overview/adspend';
import TotalCostPerMessageContainer from '@/components/dashboard/overview/cpm';
import TotalImpressionsContainer from '@/components/dashboard/overview/impressions';
import TotalProfitContainer from '@/components/dashboard/overview/adsrunning';
import { TotalReach } from '@/components/dashboard/overview/reach';
import DatePickerComponent from '@/components/dashboard/overview/DateRangePicker';
import { DateProvider } from '@/components/dashboard/overview/date/DateContext';
import TotalAdsContainer from '@/components/dashboard/overview/adsrunning';
import Joyride, { Step } from 'react-joyride';
import { useTour } from '@/contexts/TourContext'; // Import the useTour hook from your TourContext

export default function Page(): React.JSX.Element {
  const { runTour, steps } = useTour(); // Access global tour state and steps
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isMounted, setIsMounted] = useState<boolean>(false); // Track mounting state

  useEffect(() => {
    // Set the isMounted state to true after the component mounts
    setIsMounted(true);
  }, []);

  return (
    <DateProvider>
      {/* Conditionally render Joyride only after mounting */}
      {isMounted && (
        <Joyride
        steps={steps} // Use global steps
        run={runTour} // Use the global runTour state
        continuous
        showSkipButton
        showProgress
        styles={{
          options: {
            zIndex: 10000, // Ensure the tour stays on top of other UI elements
          },
          }}
        />
      )}
      <Grid container spacing={2}>
        <Grid item lg={3} md={6} xs={12} className="budget-container">
          <BudgetContainer startDate={startDate} endDate={endDate} />
        </Grid>
        <Grid item lg={3} md={6} xs={12} className="impressions-container">
          <TotalImpressionsContainer startDate={startDate} endDate={endDate} />
        </Grid>
        <Grid item lg={3} md={6} xs={12} className="cpm-container">
          <TotalCostPerMessageContainer startDate={startDate} endDate={endDate} />
        </Grid>
        <Grid item lg={3} md={6} xs={12} className="profit-container">
          <TotalProfitContainer />
        </Grid>
        <Grid item lg={12} xs={12} className="date-picker">
          <DatePickerComponent
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </Grid>
        <Grid item lg={8} xs={12} className="ad-spend-chart">
          <Sales timeRange="custom" startDate={startDate} endDate={endDate} sx={{ height: '570px' }} />
        </Grid>
        <Grid item lg={4} md={6} xs={12} className="total-reach">
          <TotalReach startDate={startDate} endDate={endDate} sx={{ height: '570px' }} />
        </Grid>
      </Grid>
    </DateProvider>
  );
}
