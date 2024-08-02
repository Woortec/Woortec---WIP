import React from 'react';
import styles from './styles/ProgressBar.module.css';

const ProgressBar: React.FC<{ step: number }> = ({ step }) => {
  return (
    <div className={styles.container}>
      <div className={styles.stepContainer}>
        <div className={`${styles.checkIcon} ${step > 1 ? styles.completed : ''}`}>
          {step > 1 ? <img src="/check.svg" alt="Check" className={styles.checkImage} /> : <span className={styles.stepText}>1</span>}
        </div>
        <span className={styles.stepText}>Strategy</span>
      </div>
      <div className={styles.progressBar}></div>
      <div className={styles.stepContainer}>
        <div className={`${styles.checkIcon} ${step > 2 ? styles.completed : ''}`}>
          {step > 2 ? <img src="/check.svg" alt="Check" className={styles.checkImage} /> : <span className={styles.stepText}>2</span>}
        </div>
        <span className={styles.stepText}>Images</span>
      </div>
      <div className={styles.progressBar}></div>
      <div className={styles.stepContainer}>
        <div className={`${styles.checkIcon} ${step > 3 ? styles.completed : ''}`}>
          {step > 3 ? <img src="/check.svg" alt="Check" className={styles.checkImage} /> : <span className={styles.stepText}>3</span>}
        </div>
        <span className={styles.stepText}>More Information</span>
      </div>
    </div>
  );
};

export default ProgressBar;
