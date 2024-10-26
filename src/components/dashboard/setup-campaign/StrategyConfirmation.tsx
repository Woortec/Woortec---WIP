import React from 'react';
import styles from './styles/StrategyConfirmation.module.css';

interface StrategyConfirmationProps {
    campaignId: string | null;
}

const StrategyConfirmation: React.FC<StrategyConfirmationProps> = ({ campaignId }) => {
    return (
        <div className={styles.confirmationContainer}>
            <h2>Campaign Confirmation</h2>
            {campaignId ? (
                <p>Campaign successfully created with ID: <strong>{campaignId}</strong></p>
            ) : (
                <p>Campaign creation failed. Please try again.</p>
            )}
        </div>
    );
};

export default StrategyConfirmation;
