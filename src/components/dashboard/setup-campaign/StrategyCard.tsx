'use client';

import React, { useState } from 'react';
import ProgressBar from './ProgressBar'; // Import the progress bar component
import styles from './styles/StrategyCard.module.css';

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
        <div>
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
      <div className={styles.buttonContainer}>
        <button className={styles.dlButton}>Download Strategy</button>
        <button className={styles.conButton}>Continue</button>
      </div>
    </div>
  );
};

export default StrategyCard;
