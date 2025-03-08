'use client';

import React, { useState } from 'react';
import ProgressBar from './ProgressBar'; // Import the progress bar component
import styles from './styles/StrategyCard.module.css';
import { styled } from '@mui/material/styles';
import { Button, Box } from '@mui/material';


interface StrategyCardProps {
  onNext: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ onNext }) => {
  const [currentStep, setCurrentStep] = useState(1); // Track current step

  const handleStrategySelect = () => {
    setCurrentStep(currentStep + 1); // Increment step when selecting a strategy
    onNext();
  };

  return (
    <div className={styles.strategyContainer}>
      <h1 className={styles.headerLabel}>Campaign Setup</h1>
        <div className={styles.description}>
          Introducing woortec - the ultimate social media ads
          product designed to elevate your online presence and drive results
          like never before. With woortec, you can effortlessly create and
          manage ads across multiple social media platforms, all in one place.
        </div>
      {/* Progress Bar Section */}
      <ProgressBar currentStep={currentStep} /> {/* Progress Bar above cards */}

      <h4 className={styles.headings}>Choose your strategy:</h4>

      {/* Strategy Card Group */}
      <div className={styles.cardGroup}>
        <div className={`${styles.card} ${styles.active}`} onClick={handleStrategySelect}>
          <img src="/images/strategy.svg" alt="Launching Strategy" />
          <h3 className={styles.cardTitle}>LAUNCHING STRATEGY</h3>
          <p>Introducing Woortec - the ultimate social media ads product designed to elevate your marketing.</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <img src="/images/strategy-locked.svg" alt="Locked Strategy" />
          <h3 className={styles.cardTitle}>(THIS STRATEGY IS LOCKED)</h3>
          <p>This strategy will be unlocked once you finish the first strategy that we gave you.</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <img src="/images/teamwork.svg" alt="Locked Strategy" />
          <h3 className={styles.cardTitle}>(THIS STRATEGY IS LOCKED)</h3>
          <p>This strategy will be unlocked once you finish the first strategy that we gave you.</p>
        </div>
      </div>
      <Box
          display="flex"
          gap={1}
          sx={{
            flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger
            justifyContent: "center", // Center on larger screens
            alignItems: "center", // Align buttons when stacked
          }}
          >
        <Button
          variant="outlined"
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }, // Increase font size on larger screens
            padding: { xs: "8px 12px", sm: "10px 16px", md: "12px 20px" }, // Adjust padding
            backgroundColor: '#FFFFFF', // Add '#' before the hex code
            '&:hover': { backgroundColor: '#486A75', color: '#FFFFFF', }, // Optional: Change color on hover
            color: '#486A75',
            border: "1px solid #486A75", // Increased border thickness
          }}>Delete</Button>

        <Button
          variant="outlined"
          sx={{
            fontSize: { xs: "0.75rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" },
            padding: { xs: "8px 12px", sm: "10px 16px", md: "12px 20px" },
            backgroundColor: '#FFFFFF', // Add '#' before the hex code
            '&:hover': { backgroundColor: '#486A75', color: '#FFFFFF', }, // Optional: Change color on hover
            color: '#486A75',
            border: "1px solid #486A75", // Increased border thickness
          }}>Continue</Button>
      </Box>

    </div>
  );
};

export default StrategyCard;
