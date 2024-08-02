import React, { useState } from 'react';
import styles from './styles/CampaignDetailsForm.module.css';
import ProgressBar from './ProgressBar';

const CampaignDetailsForm: React.FC<{ nextStep: () => void }> = ({ nextStep }) => {
  const [formDetails, setFormDetails] = useState({
    objective: '',
    startDate: '',
    budget: '',
    adMessage: '',
    adLink: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('campaignDetails', JSON.stringify(formDetails));
    nextStep();
  };

  return (
    <div className={styles.container}>
      <ProgressBar step={1} />
      <h2 className={styles.title}>Campaign Setup: Strategy Name</h2>
      <p className={styles.description}>Introducing woorctec - the ultimate social media ads product...</p>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formContent}>
          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label className={styles.question}>Objective:</label>
              <input
                type="text"
                name="objective"
                value={formDetails.objective}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.questionGroup}>
              <label className={styles.question}>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={formDetails.startDate}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label className={styles.question}>Budget:</label>
              <input
                type="number"
                name="budget"
                value={formDetails.budget}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.questionGroup}>
              <label className={styles.question}>Ad Message:</label>
              <input
                type="text"
                name="adMessage"
                value={formDetails.adMessage}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.questionGroup}>
              <label className={styles.question}>Ad Link:</label>
              <input
                type="url"
                name="adLink"
                value={formDetails.adLink}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitButton}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignDetailsForm;
