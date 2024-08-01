import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/CampaignForm.module.css';

const CampaignForm = () => {
  const [objective, setObjective] = useState('');
  const [planRequestDate, setPlanRequestDate] = useState('');
  const [amountToInvest, setAmountToInvest] = useState('');
  const [adMessage, setAdMessage] = useState('');
  const [adLink, setAdLink] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('objective', objective);
    localStorage.setItem('planRequestDate', planRequestDate);
    localStorage.setItem('amountToInvest', amountToInvest);
    localStorage.setItem('adMessage', adMessage);
    localStorage.setItem('adLink', adLink);

    const analysisObjectives = ['engagement-focused', 'aim-for-sales'];
    const launchingObjectives = ['collect-data', 'target-interested-clients', 'have-a-landing-page'];

    if (analysisObjectives.includes(objective)) {
      navigate('/dashboard/preparing', { state: { next: 'analysis' } });
    } else if (launchingObjectives.includes(objective)) {
      navigate('/dashboard/preparing', { state: { next: 'launching' } });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Campaign Setup</h2>
      <p className={styles.description}>
        Introducing woortec - the ultimate social media ads product designed to elevate your online presence and drive
        results like never before. With woortec, you can effortlessly create and manage ads across multiple social media
        platforms, all in one place.
      </p>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.formContent}>
          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label htmlFor="objective" className={styles.question}>What is your objective with this investment?</label>
              <select id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} required className={styles.selectWrapper}>
                <option value="">Select the best option</option>
                <option value="engagement-focused">Engagement-focused</option>
                <option value="aim-for-sales">Aim for sales</option>
                <option value="collect-data">Collect data via quick form</option>
                <option value="target-interested-clients">Target interested clients</option>
                <option value="have-a-landing-page">Have a landing page</option>
              </select>
            </div>
            <div className={styles.questionGroup}>
              <label htmlFor="planRequestDate" className={styles.question}>Plan Request Date:</label>
              <input
                type="date"
                id="planRequestDate"
                value={planRequestDate}
                onChange={(e) => setPlanRequestDate(e.target.value)}
                required
                className={styles.selectWrapper}
              />
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.questionGroup}>
              <label htmlFor="amountToInvest" className={styles.question}>Amount to Invest:</label>
              <input
                type="number"
                id="amountToInvest"
                value={amountToInvest}
                onChange={(e) => setAmountToInvest(e.target.value)}
                required
                className={styles.selectWrapper}
              />
            </div>
            <div className={styles.questionGroup}>
              <label htmlFor="adMessage" className={styles.question}>Ad Message:</label>
              <textarea
                id="adMessage"
                value={adMessage}
                onChange={(e) => setAdMessage(e.target.value)}
                required
                className={styles.selectWrapper}
              />
            </div>
            <div className={styles.questionGroup}>
              <label htmlFor="adLink" className={styles.question}>Ad Link:</label>
              <input
                type="url"
                id="adLink"
                value={adLink}
                onChange={(e) => setAdLink(e.target.value)}
                required
                className={styles.selectWrapper}
              />
            </div>
          </div>
          <button type="submit" className={styles.submitButton}>Continue</button>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;
