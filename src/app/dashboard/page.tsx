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

export default function Page(): React.JSX.Element {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [runTour, setRunTour] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false); // Track mounting state

  useEffect(() => {
    // Set the isMounted state to true after the component mounts
    setIsMounted(true);
  }, []);

  const steps: Step[] = [
    {
      target: '.budget-container',
      content: 'This is where you can see your budget overview.',
    },
    {
      target: '.impressions-container',
      content: 'This shows the total impressions your ads have received.',
    },
    {
      target: '.cpm-container',
      content: 'This displays the cost per message for your ads.',
    },
    {
      target: '.profit-container',
      content: 'Here you can see the total ads running and their profit.',
    },
    {
      target: '.date-picker',
      content: 'Use this to select the date range for your data.',
    },
    {
      target: '.ad-spend-chart',
      content: 'This chart shows your ad spend over time.',
    },
    {
      target: '.total-reach',
      content: 'Check the total reach of your ads, including clicks and messages started.',
    }
  ];

  return (
    <DateProvider>
      {/* Conditionally render Joyride only after mounting */}
      {isMounted && (
        <Joyride
          steps={steps}
          run={runTour}
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
