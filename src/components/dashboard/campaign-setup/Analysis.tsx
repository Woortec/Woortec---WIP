import React from 'react';
import styles from './styles/Analysis.module.css';
import axios from 'axios';
import withAuth from '@/components/withAuth';

const Analysis: React.FC = () => {
  const createCampaign = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const fbPage = localStorage.getItem('fbPage');
    const adMessage = localStorage.getItem('adMessage');
    const adLink = localStorage.getItem('adLink');
    const planOutput = localStorage.getItem('planOutput');

    if (!accessToken || !userId || !fbPage) {
      alert('Missing required information to create a campaign.');
      return;
    }

    try {
      const response = await axios.post('/api/create-campaign', {
        planOutput,
        accessToken,
        userId,
        fbPage,
        adMessage,
        adLink,
      });
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign.');
    }
  };

  return (
    <div className={styles.analysisContainer}>
      <h2>Analysis Strategy</h2>
      <p>Your analysis strategy details go here.</p>
      <button onClick={createCampaign}>Create Campaign</button>
    </div>
  );
};

export default withAuth(Analysis);
