import React from 'react';
import styles from './styles/StrategyConfirmation.module.css';

interface StrategyConfirmationProps {
    campaignId: string | null;
}

const StrategyConfirmation: React.FC<StrategyConfirmationProps> = ({ campaignId }) => {
    return (
        <div className={styles.confirmationContainer}>
            <h1 className={styles.headerLabel}>Strategy Creation</h1>
                <div className={styles.description}>
                Introducing woortec - the ultimate social media ads product designed to elevate your online presence and 
                drive results like never before. With woortec, you can effortlessly create and manage ads across multiple 
                social media platforms, all in one place. 
                </div>

                    <center><img
                      src="/assets/projections.svg"
                      alt="Projection Icon"
                      className={styles.campaignImage}
                    /></center>
            <h2>Your ads have just been set up in the platform!</h2>
            <p>Please check everything </p>
            <button>Check out here</button>
            {/* {campaignId ? (
                <p>Campaign successfully created with ID: <strong>{campaignId}</strong></p>
            ) : (
                <p>Campaign creation failed. Please try again.</p>
            )} */}
        </div>
    );
};

export default StrategyConfirmation;
