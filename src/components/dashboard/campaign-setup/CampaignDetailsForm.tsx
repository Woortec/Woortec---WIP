import React, { useState } from 'react';
import styles from './styles/CampaignDetailsForm.module.css';
import ProgressBar from './ProgressBar';

const CampaignDetailsForm: React.FC<{ nextStep: () => void }> = ({ nextStep }) => {
  const [formDetails, setFormDetails] = useState({
    objective: '',
    target1: '',
    target2: '',
    investmentObjective: '',
    investmentTarget: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('campaignDetails', JSON.stringify(formDetails));
    nextStep();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Strategy Creation</h1>
      <ProgressBar step={1} />
      <p className={styles.description}>
        Introducing woorctec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With woorctec, you can effortlessly create and manage ads across multiple social media platforms, all in one place.
      </p>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formContent}>
          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label className={styles.question}>What is your objective with this investment?</label>
              <div className={styles.optionsGroup}>
                <label className={styles.optionItem}>
                  <input
                    type="radio"
                    name="investmentObjective"
                    value="yes"
                    checked={formDetails.investmentObjective === 'yes'}
                    onChange={handleChange}
                    className={styles.input}
                  />
                  Yes
                </label>
                <label className={styles.optionItem}>
                  <input
                    type="radio"
                    name="investmentObjective"
                    value="no"
                    checked={formDetails.investmentObjective === 'no'}
                    onChange={handleChange}
                    className={styles.input}
                  />
                  No
                </label>
                <label className={styles.optionItem}>
                  <input
                    type="radio"
                    name="investmentObjective"
                    value="irrelevant"
                    checked={formDetails.investmentObjective === 'irrelevant'}
                    onChange={handleChange}
                    className={styles.input}
                  />
                  Irrelevant
                </label>
              </div>
            </div>
            <div className={styles.questionGroup}>
              <label className={styles.question}>What is your target?</label>
              <select
                name="target1"
                value={formDetails.target1}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Select the best option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>
            <div className={styles.questionGroup}>
              <label className={styles.question}>What is your target?</label>
              <select
                name="target2"
                value={formDetails.target2}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Select the best option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label className={styles.question}>What is your objective with this investment?</label>
              <select
                name="investmentTarget"
                value={formDetails.investmentTarget}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Select the best option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>
            <div className={styles.questionGroup}>
              <label className={styles.question}>What is your target?</label>
              <select
                name="investmentTarget"
                value={formDetails.investmentTarget}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Select the best option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitButton}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignDetailsForm;
