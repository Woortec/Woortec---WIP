import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Use Next.js's usePathname to get current path
import styles from './styles/StepIndicator.module.css';


const StepIndicator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1); // Track the active step
  const pathname = usePathname(); // Get the current pathname

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
    <div className={styles.stepsContainer}>
      <div className={`${styles.stepWrapper} ${activeStep === 1 ? styles.active : ''}`}>
        <div className={styles.stepIcon}>
              {activeStep >= 2 ? (
            <img src="/images/check.svg" alt="Check Icon" className={styles.checkIcon} />
          ) : (
            <img src="/images/objective.svg" alt="Objective Icon" />
          )}
        </div>
        <span className={styles.stepLabel}>Objective</span>
      </div>
      
      <div className={styles.stepLine}></div>
      
      <div className={`${styles.stepWrapper} ${activeStep === 2 ? styles.active : ''}`}>
        <div className={styles.stepIcon}>
          <img src="/images/strategy-info.svg" alt="Strategy Creation Icon" />
        </div>
        <span className={styles.stepLabel}>Strategy Creation</span>
      </div>
      
      <div className={styles.stepLine}></div>
      
      <div className={`${styles.stepWrapper} ${activeStep === 3 ? styles.active : ''}`}>
        <div className={styles.stepIcon}>
          <img src="/images/strategy-result.svg" alt="Strategy Result Icon" />
        </div>
        <span className={styles.stepLabel}>Strategy Result</span>
      </div>
    </div>
  );
};

export default StepIndicator;
