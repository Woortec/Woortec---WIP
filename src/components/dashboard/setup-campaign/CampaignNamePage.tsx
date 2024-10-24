'use client';

import React, { useState } from 'react';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client
import ProgressBar from './ProgressBar'; // Import the ProgressBar component
import styles from './styles/CampaignNamePage.module.css';

interface CampaignNamePageProps {
  onNext: () => void;
  onBack: () => void;
  setCampaignData: React.Dispatch<React.SetStateAction<{ campaignName: string; labelOne: string; labelTwo: string } | null>>; // Add setCampaignData prop
}

const CampaignNamePage: React.FC<CampaignNamePageProps> = ({ onNext, onBack, setCampaignData }) => {
  const [labelOne, setLabelOne] = useState<string>('');
  const [labelTwo, setLabelTwo] = useState<string>('');
  const [campaignName, setCampaignNameLocal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Added loading state

  const handleNext = async () => {
    if (!labelOne || !labelTwo || !campaignName) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true); // Set loading to true when starting

    try {
      const supabase = createClient();
      const userId = localStorage.getItem('userid'); // Assuming you have the userId in localStorage

      const { error } = await supabase
        .from('facebook_campaign_data')
        .upsert({
          user_id: userId,
          label_one: labelOne,
          label_two: labelTwo,
          campaign_name: campaignName,
        }, {
          onConflict: ['user_id'], // Ensure there's only one row per user_id
        });

      if (error) {
        console.error('Error saving data to Supabase:', error);
        alert('Failed to save the data. Please try again.');
      } else {
        setCampaignData({ campaignName, labelOne, labelTwo }); // Set the campaign data in the parent component
        onNext(); // Proceed to the next step
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false); // Set loading back to false after saving
    }
  };

  return (
    <div className={styles.nameContainerWrapper}>
      <div className={styles.nameContainer}>
        {/* Progress Bar Section - Place at the top of the name container */}
        <ProgressBar currentStep={3} />

        {/* Campaign Name and Labels Form */}
        <h2>Choose your Campaign Name</h2>
        <input
          type="text"
          placeholder="Campaign Name"
          className={styles.input}
          value={campaignName}
          onChange={(e) => setCampaignNameLocal(e.target.value)}
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
          <button className={styles.backButton} onClick={onBack} disabled={loading}>
            Go Back
          </button>
          <button className={styles.sendButton} onClick={handleNext} disabled={loading}>
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignNamePage;
