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
import Check from '@mui/icons-material/Check';
import styles from './styles/ProgressBar.module.css';

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  'Strategy',
  'Images',
  'More Information',
];

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  textAlign: 'left', // Align text to the left
  maxWidth: 800,
}));

const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  textAlign: 'left', // Align text to the left
  margin: 0, // No auto margin
  fontSize: 15,
}));

const Brand = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
}));

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
  },
}));


const StepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: '#FFFFFF',
  zIndex: 1,
  color: '#7C9BA5',
  width: '12vw',
  height: '5vh', // Responsive height
  display: 'flex',
  borderRadius: '24px',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'bold',
  fontSize: '1rem', // Adjust text size responsively
  border: '3px solid #FFFFFF',
  ...(ownerState.active && {
    backgroundColor: '#F2F4F5',
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.primary.main,
  }),
  
    // Media Queries for smaller screens
    [`@media (max-width: 768px)`]: {
      width: '16vw',
      minWidth: '60px',
      fontSize: '0.9rem',
    },
  
    [`@media (max-width: 480px)`]: {
      width: '20vw',
      minWidth: '50px',
      fontSize: '0.8rem',
      height: '4vh',
    },
}));

function StepIcon(props: any) {
  const { active, completed, className, label } = props; // Destructure the label prop
  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      <Typography variant="body2" style={{ fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
        {label}  {/* Display the step label inside the circle */}
      </Typography>
    </StepIconRoot>
  );
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <Container className={styles.container}>
        <Box py={0} sx={{ margin: 0, padding: 0 }}>
        {/* Progress Bar */}
        <Stepper activeStep={currentStep - 1} alternativeLabel connector={<Connector />} 
        sx={{ marginTop: '20px'}} // Adding margin to the entire Stepper component
        >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={(props) => <StepIcon {...props} label={label} />}>
              {/* Optionally, you can still show the label as a tooltip or outside the circle */}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      </Box>
    </Container>
  );
};

export default ProgressBar;
