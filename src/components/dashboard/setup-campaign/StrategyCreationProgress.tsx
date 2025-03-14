'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/StrategyCreationProgress.module.css';
import axios from 'axios';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client
import ProgressBar from './ProgressBar'; // Import ProgressBar component

interface StrategyCreationProgressProps {
  planOutput: any;
  imageFile: File | null;
  campaignData: { campaignName: string; labelOne: string; labelTwo: string } | null;
  onNext: (campaignId: string) => void; // Ensure this only accepts string now
}

const StrategyCreationProgress: React.FC<StrategyCreationProgressProps> = ({
  planOutput,
  imageFile,
  campaignData,
  onNext, // Call this function when the campaign is created
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const createCampaignCalled = useRef<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          createCampaign(); // Call the campaign creation when progress reaches 100%
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const createCampaign = async () => {
    if (createCampaignCalled.current) {
      return;
    }
    createCampaignCalled.current = true;

    const userId = localStorage.getItem('userid');
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    const supabase = createClient();

    try {
      const { data: campaignData, error } = await supabase
        .from('facebook_campaign_data')
        .select('label_one, label_two, campaign_name, image_path')
        .eq('user_id', userId)
        .single();

      if (error || !campaignData) {
        console.error('Error fetching campaign data from Supabase:', error);
        return;
      }

      const { label_one, label_two, campaign_name, image_path } = campaignData;

      if (!label_one || !label_two || !campaign_name || !image_path) {
        console.error('Missing required fields for campaign creation');
        return;
      }

      const formData = new FormData();
      formData.append('labelOne', label_one);
      formData.append('labelTwo', label_two);
      formData.append('campaignName', campaign_name);
      formData.append('userId', userId);

      const imageBlob = await fetch(image_path).then((res) => res.blob());
      if (imageBlob) {
        const imageFile = new File([imageBlob], 'adImage.jpg');
        formData.append('image', imageFile);
      } else {
        console.error('Image could not be retrieved from the provided path');
        return;
      }

      const response = await axios.post('/api/create-campaign', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const campaignId = response.data?.adResponse?.id;
      if (campaignId) {
        console.log('Campaign created successfully:', campaignId);
        onNext(campaignId); // Move to the next step with campaignId
      } else {
        console.error('Campaign creation failed: No campaign ID returned');
        throw new Error('No campaign ID returned');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.progressContainerWrapper}>
      <h1 className={styles.headerLabel}>Strategy Creation</h1>
        <div className={styles.description}>
        Introducing woortec - the ultimate social media ads product designed to elevate your online presence and 
        drive results like never before. With woortec, you can effortlessly create and manage ads across multiple 
        social media platforms, all in one place. 
        </div>

        <center><img
          src="/assets/analyzedata.svg"
          alt="Campaign Creation Icon"
          className={styles.campaignImage}
        /></center>
        <p>Creating your campaign...</p>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }}></div>
        </div>
        <p>{progress}%</p>
    </div>
  );
};

export default StrategyCreationProgress;
