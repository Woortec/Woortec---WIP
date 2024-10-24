// ProgressBar.tsx

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

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  'Strategy',
  'Ad Creatives',
  'Campaign Names',
  'Campaign Creations',
  'Campaign Results',
];

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  maxWidth: 800,
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const Brand = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 700,
}));

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const StepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: theme.palette.primary.main,
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.primary.main,
  }),
}));

function StepIcon(props: any) {
  const { active, completed, className } = props;

  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <Check /> : props.icon}
    </StepIconRoot>
  );
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <Container maxWidth="md">
      <Box py={5}>
        {/* Title and Description */}
        <Title variant="h4">Campaign Setup</Title>
        <Description variant="body1">
          Introducing <Brand>woortec</Brand> - the ultimate social media ads
          product designed to elevate your online presence and drive results
          like never before. With woortec, you can effortlessly create and
          manage ads across multiple social media platforms, all in one place.
        </Description>

        {/* Progress Bar */}
        <Stepper
          activeStep={currentStep - 1}
          alternativeLabel
          connector={<Connector />}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Container>
  );
};

export default ProgressBar;
