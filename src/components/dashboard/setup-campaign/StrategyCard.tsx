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
      {/* Progress Bar Section */}
      <ProgressBar currentStep={currentStep} /> {/* Progress Bar above cards */}

      <h2>Choose your strategy:</h2>

      {/* Strategy Card Group */}
      <div className={styles.cardGroup}>
        <div className={`${styles.card} ${styles.active}`} onClick={handleStrategySelect}>
          <img src="/images/strategy.svg" alt="Launching Strategy" />
          <h3>Launching Strategy</h3>
          <p>Introducing Woortec - the ultimate social media ads product designed to elevate your marketing.</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <img src="/images/strategy-locked.svg" alt="Locked Strategy" />
          <h3>(This strategy is locked)</h3>
          <p>This strategy will be unlocked once you finish the first strategy that we gave you.</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <img src="/images/strategy-locked.svg" alt="Locked Strategy" />
          <h3>(This strategy is locked)</h3>
          <p>This strategy will be unlocked once you finish the first strategy that we gave you.</p>
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;
