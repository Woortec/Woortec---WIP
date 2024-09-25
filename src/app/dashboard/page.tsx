'use client';

import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid'; // Use stable Grid instead of Unstable_Grid2

import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Joyride, { Step } from 'react-joyride';

import { useTour } from '@/contexts/TourContext'; // Import the useTour hook from your TourContext
import { userData } from '@/contexts/user-context';
import { Sales } from '@/components/dashboard/overview/adspend';
import TotalProfitContainer from '@/components/dashboard/overview/adsrunning';
import TotalAdsContainer from '@/components/dashboard/overview/adsrunning';
import BudgetContainer from '@/components/dashboard/overview/budget';
import TotalCostPerMessageContainer from '@/components/dashboard/overview/cpm';
import { DateProvider } from '@/components/dashboard/overview/date/DateContext';
import DatePickerComponent from '@/components/dashboard/overview/DateRangePicker';
import TotalImpressionsContainer from '@/components/dashboard/overview/impressions';
import { TotalReach } from '@/components/dashboard/overview/reach';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Page(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { runTour, steps } = useTour();
  const { user, fetchApiData, isIndustryFilled, userInfo, addIndustry } = userData();
  const [industryName, setIndustryName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleIndustry = () => {
    console.log('Industry Name:', industryName);
    console.log('Date of Birth:', dateOfBirth);
    addIndustry(industryName, dateOfBirth, userInfo.uuid);
    handleClose();
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('userid', user.id);
      fetchApiData(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (userInfo && !userInfo?.isIndustry) {
      setOpen(true);
    }
  }, [userInfo]);

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={style}>
          {/* Modal Title */}
          <Typography id="modal-title" variant="h6" component="h2">
            Enter Details
          </Typography>

          {/* Industry Name Input */}
          <TextField
            label="Industry Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={industryName}
            onChange={(e) => setIndustryName(e.target.value)}
          />

          {/* Date of Birth Input */}
          <TextField
            label="Date of Birth"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />

          {/* Submit Button */}
          <Button variant="contained" color="secondary" onClick={handleIndustry} sx={{ mt: 2 }} fullWidth>
            Submit
          </Button>
        </Box>
      </Modal>
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
    </>
  );
}
