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

interface ProgressBarProps {
  currentStep: number;
}

const steps = ['Strategy', 'Images', 'More Information'];

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
    width: '100%', // Ensure full width
    flexGrow: 1, // Allow expansion
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    width: '100%', // Make sure it covers full width
  },
}));

const StepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: '#FFFFFF !important',
  color: '#7C9BA5 !important',
  width: '100% !important',
  height: '5vh !important',
  borderRadius: '24px !important',
  display: 'flex !important',
  justifyContent: 'center !important',
  alignItems: 'center !important',
  padding: '1vh',
  fontSize: '24px',

  ...(ownerState.active && {
    backgroundColor: '#F2F4F5 !important',
  }),

  ...(ownerState.completed && {
    backgroundColor: theme.palette.primary.main + ' !important',
  }),
}));

function StepIcon(props: any) {
  const { active, completed, className, label } = props;
  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      <Typography>{label}</Typography>
    </StepIconRoot>
  );
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <Container className={styles.Container}
      maxWidth={false}>
      <Box>
        
<Stepper
  activeStep={currentStep - 1}
  alternativeLabel
  connector={<Connector />}
  sx={{
    width: '100%', // Make sure it takes the full viewport width
    display: 'flex',
  }}
>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={(props) => <StepIcon {...props} label={label} />} />
            </Step>
          ))}
        </Stepper>
      </Box>
    </Container>
  );
};

export default ProgressBar;
