'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Joyride from 'react-joyride';
import { useTour } from '@/contexts/TourContext';
import { userData } from '@/contexts/user-context';
import { Sales } from '@/components/dashboard/overview/adspend';
import TotalProfitContainer from '@/components/dashboard/overview/adsrunning';
import BudgetContainer from '@/components/dashboard/overview/budget';
import TotalCostPerMessageContainer from '@/components/dashboard/overview/cpm';
import { DateProvider } from '@/components/dashboard/overview/date/DateContext';
import DatePickerComponent from '@/components/dashboard/overview/DateRangePicker';
import TotalImpressionsContainer from '@/components/dashboard/overview/impressions';
import { TotalReach } from '@/components/dashboard/overview/reach';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// Import SuccessModal
import SuccessModal from '@/pages/success';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100vh',
  height: '500px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

export default function Page(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { runTour, steps } = useTour();
  const { user, fetchApiData, userInfo, addIndustry } = userData();
  const [industryName, setIndustryName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // SuccessModal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleIndustry = () => {
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

  // Function to open SuccessModal
  const handlePaymentSuccess = (sessionId: string) => {
    setSessionId(sessionId);
    setIsSuccessModalOpen(true);
  };

  // Detect session_id from URL manually (without `useSearchParams`)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const session_id = urlParams.get('session_id');
      if (session_id) {
        handlePaymentSuccess(session_id);
      }
    }
  }, []);

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={style}>
          <Typography id="modal-title" variant="h5" component="h2" gutterBottom sx={{ mt: 5 }}>
            You’re almost there!
          </Typography>

          <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 6 }}>
            To ensure a more personalized and efficient experience, we just need a few more details from you.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <TextField
              label="Date of Birth"
              type="date"
              variant="outlined"
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              sx={{ width: '250px' }}
            />

            <FormControl variant="outlined" sx={{ width: '400px' }}>
              <InputLabel id="industry-select-label">Industry Occupation</InputLabel>
              <Select
                labelId="industry-select-label"
                value={industryName}
                onChange={(e) => setIndustryName(e.target.value)}
                label="Industry Occupation"
              >
                <MenuItem value="">
                  <em>Select Industry</em>
                </MenuItem>
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                <MenuItem value="Hospitality">Hospitality</MenuItem>
                <MenuItem value="Real Estate">Real Estate</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
                <MenuItem value="Marketing/Advertising">Marketing/Advertising</MenuItem>
                <MenuItem value="Consulting">Consulting</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button variant="contained" color="primary" onClick={handleIndustry} sx={{ mt: 7, width: '200px' }}>
            Continue
          </Button>
        </Box>
      </Modal>

      {/* SuccessModal - Automatically opens after payment */}
      <SuccessModal
        sessionId={sessionId}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      <DateProvider>
        {isMounted && (
          <Joyride
            steps={steps}
            run={runTour}
            continuous
            showSkipButton
            showProgress
            styles={{
              options: {
                zIndex: 10000,
              },
            }}
          />
        )}

        <Grid container spacing={2}>
          <Grid item lg={3} md={6} xs={12}>
            <BudgetContainer startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item lg={3} md={6} xs={12}>
            <TotalImpressionsContainer startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item lg={3} md={6} xs={12}>
            <TotalCostPerMessageContainer startDate={startDate} endDate={endDate} />
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
          <Grid item lg={8} md={6} xs={12}>
            <Sales timeRange="custom" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item lg={4} md={6} xs={12}>
            <TotalReach startDate={startDate} endDate={endDate} />
          </Grid>
        </Grid>
      </DateProvider>
    </>
  );
}
