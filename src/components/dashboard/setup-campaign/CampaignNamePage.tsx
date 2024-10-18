'use client';

import React, { useState } from 'react';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client
import styles from './styles/CampaignNamePage.module.css';

interface CampaignNamePageProps {
    onNext: () => void;
    onBack: () => void;
    setCampaignData: (data: { campaignName: string; labelOne: string; labelTwo: string }) => void; // Add this line
  }

const CampaignNamePage: React.FC<CampaignNamePageProps> = ({ onNext, onBack }) => {
  const [labelOne, setLabelOne] = useState<string>('');
  const [labelTwo, setLabelTwo] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleNext = async () => {
    if (!labelOne || !labelTwo || !campaignName) {
      alert('Please fill in all fields.');
      return;
    }

    const supabase = createClient();
    const userId = localStorage.getItem('userid'); // Assuming you have the userId in localStorage

    setLoading(true);

    try {
      // Insert or update the campaign data into Supabase
      const { error } = await supabase
        .from('facebook_campaign_data')
        .upsert({
          user_id: userId,
          label_one: labelOne,
          label_two: labelTwo,
          campaign_name: campaignName,
        }, {
          onConflict: ['user_id'] // Ensure there's only one row per user_id
        });

      if (error) {
        console.error('Error saving data to Supabase:', error);
        alert('Failed to save the data. Please try again.');
      } else {
        onNext(); // Proceed to the next step
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.nameContainer}>
      <h2>Choose your Campaign Name</h2>
      <input
        type="text"
        placeholder="Campaign Name"
        className={styles.input}
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Label One"
        className={styles.input}
        value={labelOne}
        onChange={(e) => setLabelOne(e.target.value)}
      />
      <input
        type="text"
        placeholder="Label Two"
        className={styles.input}
        value={labelTwo}
        onChange={(e) => setLabelTwo(e.target.value)}
      />
      <div className={styles.buttons}>
        <button className={styles.backButton} onClick={onBack}>
          Go Back
        </button>
        <button className={styles.sendButton} onClick={handleNext} disabled={loading}>
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default CampaignNamePage;
