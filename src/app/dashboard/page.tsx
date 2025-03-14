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
import TotalAdsContainer from '@/components/dashboard/overview/adsrunning';
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
          <Typography id="modal-title" variant="h5" component="h2" gutterBottom sx={{ mt: 5 }}>
            You’re almost there!
          </Typography>

          <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 6 }}>
            To ensure a more personalized and efficient experience, we just need a few more details from you.
          </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            {/* Date of Birth Input */}
            <TextField
              label="Date of Birth"
              type="date"
              variant="outlined"
              fullWidth={false}  // Disable fullWidth to customize the width
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              sx={{ width: '250px' }}  // Set the custom width here
            />

            {/* Industry Name Dropdown with FormControl */}
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


          {/* Submit Button */}
                        <Button 
                variant="contained" 
                color="primary" 
                onClick={handleIndustry} 
                sx={{ mt: 7, width: '200px' }} // Added custom width of 250px
              >
                Continue
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

        {/*overview part*/}
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
          <Grid item lg={8} xs={12} className="ad-spend-chart" sx={{ height:'90vh'}}>
            <Sales timeRange="custom" startDate={startDate} endDate={endDate} />
          </Grid>
          <Grid item lg={4} md={6} xs={12} className="total-reach" sx={{ height:'72.5vh'}}>
            <TotalReach startDate={startDate} endDate={endDate}/>
          </Grid>
        </Grid>
      </DateProvider>
    </>
  );
}
