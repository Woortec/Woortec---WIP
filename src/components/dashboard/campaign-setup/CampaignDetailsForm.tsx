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
              <label className={styles.question}>What is your Objective?</label>
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
              <label className={styles.question}>How much are you willing to Invest?</label>
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
  <label className={styles.question}>Are you able to answer images?</label>
  <div>
    <label>
      <input
        type="radio"
        name="adMessage"
        value="yes"
        checked={formDetails.adMessage === 'yes'}
        onChange={handleChange}
        className={styles.input}
        required
      />
      Yes
    </label>
    <label>
      <input
        type="radio"
        name="adMessage"
        value="no"
        checked={formDetails.adMessage === 'no'}
        onChange={handleChange}
        className={styles.input}
        required
      />
      No
    </label>
  </div>
</div>
            <div className={styles.questionGroup}>
              <label className={styles.question}>Where do you want to direct the traffic</label>
              <input
                type="text"
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
