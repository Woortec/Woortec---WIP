import React from 'react';
import { usePathname } from 'next/navigation'; // Use Next.js's usePathname to get current path
import styles from './styles/StepIndicator.module.css';  // Adjust the path to your CSS file

const StepIndicator: React.FC = () => {
  const pathname = usePathname(); // Get the current pathname
  
  // Function to determine active step based on current location
  const getActiveStep = () => {
    if (pathname === "/strategy-creation") return 2;
    if (pathname === "/strategy-result") return 3;
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
