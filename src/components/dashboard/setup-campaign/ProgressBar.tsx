import React from 'react';
import styles from './styles/ProgressBar.module.css';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p>{currentStep} / {totalSteps} steps</p>
        </div>
    );
};

export default ProgressBar;
