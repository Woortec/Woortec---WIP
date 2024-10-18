// StrategyCreationProgress.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/StrategyCreationProgress.module.css';
import axios from 'axios';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client

interface StrategyCreationProgressProps {
  planOutput: any;
  imageFile: File | null;
  campaignData: { campaignName: string; labelOne: string; labelTwo: string } | null;
}

const StrategyCreationProgress: React.FC<StrategyCreationProgressProps> = ({
  planOutput,
  imageFile,
  campaignData
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const createCampaignCalled = useRef<boolean>(false); // Use useRef to track if createCampaign has been called

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
  }, []); // Empty dependency array ensures this runs only once

  const createCampaign = async () => {
    if (createCampaignCalled.current) {
      return; // Prevent multiple executions of the campaign creation
    }
    createCampaignCalled.current = true;

    const userId = localStorage.getItem('userid'); // Assuming user ID is stored here
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    const supabase = createClient();

    try {
      // Fetch stored campaign data from Supabase
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

      // Ensure that none of the values are null or undefined
      if (!label_one || !label_two || !campaign_name || !image_path) {
        console.error('Missing required fields for campaign creation');
        return;
      }

      // Construct form data to send to the API
      const formData = new FormData();
      formData.append('labelOne', label_one);
      formData.append('labelTwo', label_two);
      formData.append('campaignName', campaign_name);
      formData.append('userId', userId);

      // Fetch the image from the path and convert it into a File object if it's valid
      const imageBlob = await fetch(image_path).then((res) => res.blob());
      if (imageBlob) {
        const imageFile = new File([imageBlob], 'adImage.jpg'); // Convert blob to file
        formData.append('image', imageFile); // Append the file to formData
      } else {
        console.error('Image could not be retrieved from the provided path');
        return;
      }

      // Send data to the API
      const response = await axios.post('/api/create-campaign', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Campaign created successfully:', response.data);
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.progressContainer}>
      <h2>Strategy Creation</h2>
      <p>Creating your ads strategy...</p>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${progress}%` }}></div>
      </div>
      <p>{progress}%</p>
      {loading && <p>Creating your campaign...</p>}
    </div>
  );
};

export default StrategyCreationProgress;
