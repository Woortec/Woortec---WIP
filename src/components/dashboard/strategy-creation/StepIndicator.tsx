import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Use Next.js's usePathname to get current path
import styles from './styles/StepIndicator.module.css';
import {Box} from '@mui/material';
import { useLocale } from '@/contexts/LocaleContext';


const StepIndicator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1); // Track the active step
  const pathname = usePathname(); // Get the current pathname
  const { t } = useLocale();

  const getActiveStep = (path: string) => {
    if (path === "/dashboard/strategy/strategycreation") return 2;
    if (path === "/strategyresult") return 3;
    return 1; // Default to Objective if no match
  };

  useEffect(() => {
    if (pathname) {
      console.log(`Pathname changed: ${pathname}`);
      setActiveStep(getActiveStep(pathname)); // Update the active step if pathname is not null
    }
  }, [pathname]); // Re-run when pathname changes

  return (
    <Box className={styles.stepsContainer} sx={{
      padding: {xs:'3rem 2rem', sm:'3rem 2rem', md:'3rem 3rem'}}}>

      <Box className={`${styles.stepWrapper} ${activeStep === 1 ? styles.active : ''}`}
      sx={{width:'60%'}}>
        <Box className={styles.stepIcon}>
              {activeStep >= 2 ? (
            <img src="/images/check.svg" alt="Check Icon" className={styles.checkIcon} />
          ) : (
            <img src="/images/objective.svg" alt="Objective Icon" />
          )}
        </Box>
        <span className={styles.stepLabel}>{t('CampaignSetup.stepIndicator.objective')}</span>
      </Box>
      
      <Box className={styles.stepLine}></Box>
      
      <Box className={`${styles.stepWrapper} ${activeStep === 2 ? styles.active : ''}`}
      sx={{width:'90%'}}>
        <Box className={styles.stepIcon}>
          <img src="/images/strategy-info.svg" alt="Strategy Creation Icon" />
        </Box>
        <span className={styles.stepLabel}>{t('CampaignSetup.stepIndicator.strategyCreation')}</span>
      </Box>
      
      <Box className={styles.stepLine}></Box>
      
      <Box className={`${styles.stepWrapper} ${activeStep === 3 ? styles.active : ''}`}
      sx={{width:'80%'}}>
        <Box className={styles.stepIcon}>
          <img src="/images/strategy-result.svg" alt="Strategy Result Icon" />
        </Box>
        <span className={styles.stepLabel}>{t('CampaignSetup.stepIndicator.strategyResult')}</span>
      </Box>
    </Box>
  );
};

export default StepIndicator;
