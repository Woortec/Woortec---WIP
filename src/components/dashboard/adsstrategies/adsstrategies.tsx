'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/CampaignSetup.module.css';  // Import the CSS module

function CampaignSetup() {
  const [objective, setObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [adLink, setAdLink] = useState('');
  const [budget, setBudget] = useState('');
  const [answerMessages, setAnswerMessages] = useState('');
  const router = useRouter();

  useEffect(() => {
    const campaignDetails = localStorage.getItem('campaignDetails');
    const preparingStartTime = localStorage.getItem('preparingStartTime');

    if (campaignDetails && preparingStartTime) {
      router.push('/dashboard/adsstrategies/preparing');
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const campaignDetails = {
      objective,
      startDate,
      adLink,
      budget,
      answerMessages,
    };
    console.log(campaignDetails);
    localStorage.setItem('campaignDetails', JSON.stringify(campaignDetails));
    localStorage.setItem('preparingStartTime', new Date().toString());
    router.push('/dashboard/adsstrategies/launching');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Strategy Creation</h1>
      <p className={styles.description}>Introducing woortec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With woortec, you can effortlessly create and manage ads across multiple social media platforms, all in one place.</p>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>What's your objective with this investment?</label>
          <select 
            value={objective} 
            onChange={(e) => setObjective(e.target.value)} 
            required
            className={styles.selectWrapper}
          >
            <option value="">Select an objective</option>
            <option value="Focus on engagement">Focus on engagement</option>
            <option value="Drive sales">Drive sales</option>
            <option value="Use a quick form to collect data from potential customers">
              Use a quick form to collect data from potential customers
            </option>
            <option value="Gather information from genuinely interested clients">
              Gather information from genuinely interested clients
            </option>
            <option value="Ensure you have a landing page">Ensure you have a landing page</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>When do you want to start?</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            required 
            className={styles.selectWrapper}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>What's the ad link?</label>
          <input 
            type="url" 
            value={adLink} 
            onChange={(e) => setAdLink(e.target.value)} 
            required 
            className={styles.selectWrapper}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>How much do you want to invest?</label>
          <input 
            type="number" 
            value={budget} 
            onChange={(e) => setBudget(e.target.value)} 
            required 
            className={styles.selectWrapper}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Are you able to answer messages?</label>
          <select 
            value={answerMessages} 
            onChange={(e) => setAnswerMessages(e.target.value)} 
            required
            className={styles.selectWrapper}
          >
            <option value="">Select an answer</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>Submit</button>
      </form>
    </div>
  );
}

export default CampaignSetup;
