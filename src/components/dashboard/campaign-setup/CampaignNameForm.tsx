import React, { useState } from 'react';
import styles from './styles/CampaignNameForm.module.css';
import ProgressBar from './ProgressBar';

const CampaignNameForm: React.FC<{ prevStep: () => void; complete: () => void }> = ({ prevStep, complete }) => {
  const [campaignName, setCampaignName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCampaignName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('campaignName', campaignName);
    complete();
  };

  return (
    <div className={styles.container}>
      <ProgressBar step={3} />
      <h2 className={styles.title}>Campaign Setup: Strategy Name</h2>
      <p className={styles.description}>Introducing woorctec - the ultimate social media ads product...</p>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formContent}>
          <div className={styles.column}>
            <label className={styles.question}>Campaign Name:</label>
            <input
              type="text"
              name="campaignName"
              value={campaignName}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button type="button" onClick={prevStep} className={styles.backButton}>
            Go Back
          </button>
          <button type="submit" className={styles.submitButton}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignNameForm;
