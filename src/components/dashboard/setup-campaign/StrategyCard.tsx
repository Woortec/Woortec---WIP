'use client';

import React from 'react';
import styles from './styles/StrategyCard.module.css';

interface StrategyCardProps {
  onNext: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ onNext }) => {
  const handleStrategySelect = () => {
    // Logic for selecting the strategy can go here (if needed)
    onNext();
  };

  return (
    <div className={styles.cardContainer}>
      <h2>Choose your strategy:</h2>
      <div className={styles.cards}>
        <div className={styles.card} onClick={handleStrategySelect}>
          <h3>Launching Strategy</h3>
          <p>Introducing Woortec - the ultimate social media ads product designed to elevate.</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <h3>(This strategy is locked)</h3>
          <p>This strategy will be unlocked once you finish the first strategy.</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <h3>(This strategy is locked)</h3>
          <p>This strategy will be unlocked once you finish the first strategy.</p>
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;
