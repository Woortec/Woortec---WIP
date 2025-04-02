import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Container,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import styles from './styles/ProgressBar.module.css';
import { fontSize } from '@mui/system';

interface ProgressBarProps {
  currentStep: number;
}

const steps = ['Strategy', 'Images', 'More Information'];

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: '50%', // Center the connector
    position: 'absolute',
    zIndex: 0, // Ensures it's behind the labels
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    width: '100%',
  },
}));

const StepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: '#FFFFFF',
  color: '#BBCCD1',
  width: '10rem',
  height: '3rem',
  borderRadius: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign:'center',
  position: 'relative',
  zIndex: 1, // Keep it above the connector
  gap: '50px',

  ...(ownerState.active && {
    backgroundColor: '#F2F4F5',
    color: '#000',
  }),

  ...(ownerState.completed && {
    backgroundColor: '#F2F4F5',
  }),

    // Media Queries with specific pixel values
    [theme.breakpoints.down(800)]: {
      width: '7rem',
    },

    [theme.breakpoints.down(495)]: {
      width: '5rem',
    },
}));

function StepIcon(props: any) {
  const { active, completed, className, label } = props;
  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      <Typography variant="caption"
              sx={{
                fontSize: '0.8rem',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
                color:'#7C9BA5',
                '@media (max-width: 500px)': {fontSize: '0.6rem'},
              }}
      >{label}</Typography>
    </StepIconRoot>
  );
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <Box className={styles.container} sx={{ width: '100%', padding: '3rem 0rem',     
      '@media (max-width: 625px)': {padding: '3rem 0rem'},
      '@media (max-width: 500px)': {padding: '2rem 0rem'}, }}>
      <Stepper
        activeStep={currentStep - 1}
        alternativeLabel
        connector={<Connector />}
        sx={{ width: '100%' }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={(props) => <StepIcon {...props} label={label} />}
              sx={{
              }}
            />
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ProgressBar;

