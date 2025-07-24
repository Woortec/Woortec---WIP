'use client';

import React, { useState } from 'react';

import { useLocale } from '@/contexts/LocaleContext';

import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client
import ProgressBar from './ProgressBar'; // Import the ProgressBar component
import styles from './styles/CampaignNamePage.module.css';

interface CampaignNamePageProps {
  onNext: () => void;
  onBack: () => void;
  setCampaignData: React.Dispatch<
    React.SetStateAction<{ campaignName: string; labelOne: string; labelTwo: string } | null>
  >; // Add setCampaignData prop
}

const CampaignNamePage: React.FC<CampaignNamePageProps> = ({ onNext, onBack, setCampaignData }) => {
  const [labelOne, setLabelOne] = useState<string>('Woortec');
  const [labelTwo, setLabelTwo] = useState<string>('Woortec');
  const [campaignName, setCampaignNameLocal] = useState<string>('Woortec');
  const [loading, setLoading] = useState<boolean>(false); // Added loading state
  const { t } = useLocale();

  const handleNext = async () => {
    if (!labelOne || !labelTwo || !campaignName) {
      alert(t('CampaignSetup.campaignNamePage.pleaseFill'));
      return;
    }

    setLoading(true); // Set loading to true when starting

    try {
      const supabase = createClient();
      const userId = localStorage.getItem('userid'); // Assuming you have the userId in localStorage

      const { error } = await supabase.from('facebook_campaign_data').upsert(
        {
          user_id: userId,
          label_one: labelOne,
          label_two: labelTwo,
          campaign_name: labelOne + ' ' + labelTwo,
        },
        {
          onConflict: ['user_id'], // Ensure there's only one row per user_id
        }
      );

      if (error) {
        console.error('Error saving data to Supabase:', error);
        alert(t('CampaignSetup.campaignNamePage.saveError'));
      } else {
        setCampaignData({ campaignName, labelOne, labelTwo }); // Set the campaign data in the parent component
        onNext(); // Proceed to the next step
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert(t('CampaignSetup.campaignNamePage.unexpectedError'));
    } finally {
      setLoading(false); // Set loading back to false after saving
    }
  };

  return (
    <div className={styles.nameContainer}>
      <div className={styles.descriptionContainer}>
        <h2 className={styles.heading}>{t('CampaignSetup.campaignNamePage.title')}</h2>
        <p className={styles.paragraph}>{t('CampaignSetup.campaignNamePage.subtitle')}</p>

        <div className={styles.secContainer}>
          {/* Campaign Name and Labels Form */}
          <h2>{t('CampaignSetup.campaignNamePage.formTitle')}</h2>

          <div className={styles.inpContainer}>
            <div className={styles.inputWrapper}>
              <label>{t('CampaignSetup.campaignNamePage.labelOne')}</label>
              <input
                type="text"
                placeholder={t('CampaignSetup.campaignNamePage.placeholder')}
                className={styles.input}
                value={labelOne}
                onChange={(e) => setLabelOne(e.target.value)}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>{t('CampaignSetup.campaignNamePage.labelTwo')}</label>
              <input
                type="text"
                placeholder={t('CampaignSetup.campaignNamePage.placeholder')}
                className={styles.input}
                value={labelTwo}
                onChange={(e) => setLabelTwo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.sendButton} onClick={handleNext} disabled={loading}>
          {t('CampaignSetup.campaignNamePage.send')}
        </button>
      </div>
    </div>
  );
};

export default CampaignNamePage;