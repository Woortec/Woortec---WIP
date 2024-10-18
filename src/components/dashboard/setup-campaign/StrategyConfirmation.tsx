import React from 'react';
import styles from './styles/StrategyConfirmation.module.css';

interface StrategyConfirmationProps {
    campaignId: string | null;
  }
  
  const StrategyConfirmation: React.FC<StrategyConfirmationProps> = ({ campaignId }) => {
    return (
      <div>
        <h2>Campaign Confirmation</h2>
        {campaignId ? (
          <p>Campaign successfully created with ID: {campaignId}</p>
        ) : (
          <p>Campaign creation failed.</p>
        )}
      </div>
    );
  };
  
  export default StrategyConfirmation;
  
