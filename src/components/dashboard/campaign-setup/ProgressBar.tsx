import React from 'react';
import { Circle, CheckCircle, Info, ListChecks } from '@phosphor-icons/react';
import styles from './styles/ProgressBar.module.css';

const ProgressBar: React.FC<{ step: number }> = ({ step }) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.stepContainer} ${step >= 1 ? styles.activeStep : ''}`}>
        <div className={styles.icon}>
          {step > 1 ? (
            <CheckCircle size={24} weight="fill" />
          ) : (
            <Circle size={24} />
          )}
        </div>
        <span className={styles.stepText}>Strategy</span>
      </div>
      <div className={`${styles.progressLine} ${step > 1 ? styles.completed : ''}`}></div>
      <div className={`${styles.stepContainer} ${step >= 2 ? styles.activeStep : ''}`}>
        <div className={styles.icon}>
          {step > 2 ? (
            <CheckCircle size={24} weight="fill" />
          ) : (
            <Info size={24} />
          )}
        </div>
        <span className={styles.stepText}>Images</span>
      </div>
      <div className={`${styles.progressLine} ${step > 2 ? styles.completed : ''}`}></div>
      <div className={`${styles.stepContainer} ${step >= 3 ? styles.activeStep : ''}`}>
        <div className={styles.icon}>
          {step > 3 ? (
            <CheckCircle size={24} weight="fill" />
          ) : (
            <ListChecks size={24} />
          )}
        </div>
        <span className={styles.stepText}>More Information</span>
      </div>
    </div>
  );
};

export default ProgressBar;
