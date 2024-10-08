import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './styles/StepIndicator.module.css';  // Adjust the path to your CSS file

const StepIndicator: React.FC = () => {
  const location = useLocation();
  
  // Function to determine active step based on current location
  const getActiveStep = () => {
    if (location.pathname === "/strategy-creation") return 2;
    if (location.pathname === "/strategy-result") return 3;
    return 1; // Default to Objective if no match
  };

  const activeStep = getActiveStep();

  return (
    <div className={styles.stepsContainer}>
      <div className={styles.stepWrapper}>
        <div className={`${styles.stepCircle} ${activeStep === 1 ? styles.active : ''}`}>
          <div className={styles.icon}>🎯</div> {/* Placeholder for Objective icon */}
        </div>
        <span className={styles.stepLabel}>Objective</span>
      </div>
      
      <div className={styles.stepLine}></div>
      
      <div className={styles.stepWrapper}>
        <div className={`${styles.stepCircle} ${activeStep === 2 ? styles.active : ''}`}>
          <div className={styles.icon}>✏️</div> {/* Placeholder for Strategy Creation icon */}
        </div>
        <span className={styles.stepLabel}>Strategy Creation</span>
      </div>
      
      <div className={styles.stepLine}></div>
      
      <div className={styles.stepWrapper}>
        <div className={`${styles.stepCircle} ${activeStep === 3 ? styles.active : ''}`}>
          <div className={styles.icon}>🔍</div> {/* Placeholder for Strategy Result icon */}
        </div>
        <span className={styles.stepLabel}>Strategy Result</span>
      </div>
    </div>
  );
};

export default StepIndicator;
