'use client';

import React, { useState } from 'react';
import ProgressBar from './ProgressBar'; // Import the progress bar component
import styles from './styles/StrategyCard.module.css';
import { styled } from '@mui/material/styles';
import { Button, Box } from '@mui/material';
import { useLocale } from '@/contexts/LocaleContext';


interface StrategyCardProps {
  onNext: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ onNext }) => {
  const [currentStep, setCurrentStep] = useState(1); // Track current step
  const { t } = useLocale();
console.log(t);

  const handleStrategySelect = () => {
    setCurrentStep(currentStep + 1); // Increment step when selecting a strategy
    onNext();
  };

  return (
    <div className={styles.strategyContainer}>
      <h1 className={styles.headerLabel}>{t('CampaignSetup.title')}</h1>
        <div className={styles.description}>
          {t('CampaignSetup.subtitle')}
        </div>
        
      {/* Progress Bar Section */}
      <ProgressBar currentStep={currentStep} /> {/* Progress Bar above cards */}

      <h4 className={styles.headings}>{t('CampaignSetup.chooseStrategy')}</h4>

      {/* Strategy Card Group */}
      <div className={styles.cardGroup}>
        <div className={`${styles.card} ${styles.active}`} onClick={handleStrategySelect}>
          <img src="/images/strategy.svg" alt="Launching Strategy" />
          <h3 className={styles.cardTitle}>{t('CampaignSetup.launchingStrategy')}</h3>
          <p>{t('CampaignSetup.launchingStrategyDesc')}</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <img src="/images/strategy-locked.svg" alt="Locked Strategy" />
          <h3 className={styles.cardTitle}>{t('CampaignSetup.lockedStrategy')}</h3>
          <p>{t('CampaignSetup.lockedStrategyDesc')}</p>
        </div>
        <div className={`${styles.card} ${styles.locked}`}>
          <img src="/images/teamwork.svg" alt="Locked Strategy" />
          <h3 className={styles.cardTitle}>{t('CampaignSetup.lockedStrategy')}</h3>
          <p>{t('CampaignSetup.lockedStrategyDesc')}</p>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.dlButton}>{t('CampaignSetup.delete')}</button>
        <button className={styles.conButton}>{t('CampaignSetup.continue')}</button>
      </div>
    </div>
  );
};

export default StrategyCard;
