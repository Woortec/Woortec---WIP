import React, { useState } from 'react';
import styles from './styles/CampaignNameForm.module.css';
import ProgressBar from './ProgressBar';

const CampaignNameForm: React.FC<{ prevStep: () => void; complete: () => void }> = ({ prevStep, complete }) => {
  const [labelOne, setLabelOne] = useState('');
  const [labelTwo, setLabelTwo] = useState('');

  const handleLabelOneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLabelOne(e.target.value);
  };

  const handleLabelTwoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLabelTwo(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const campaignName = {
      labelOne,
      labelTwo,
    };
    localStorage.setItem('campaignName', JSON.stringify(campaignName));
    complete();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Campaign Setup: Strategy Name</h2>
      <p className={styles.description}>
        Introducing woorctec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With woorctec, you can effortlessly create and manage ads across multiple social media platforms, all in one place.
      </p>
      <ProgressBar step={3} />
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <p className={styles.infoText}>
          By default the campaign name will be Woortec. Do you want to add a custom label?
        </p>
        <div className={styles.formContent}>
          <div className={styles.column}>
            <label className={styles.question}>Label one</label>
            <select
              name="labelOne"
              value={labelOne}
              onChange={handleLabelOneChange}
              className={styles.input}
            >
              <option value="">Select the best option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          </div>
          <div className={styles.column}>
            <label className={styles.question}>Label two</label>
            <select
              name="labelTwo"
              value={labelTwo}
              onChange={handleLabelTwoChange}
              className={styles.input}
            >
              <option value="">Select the best option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
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
