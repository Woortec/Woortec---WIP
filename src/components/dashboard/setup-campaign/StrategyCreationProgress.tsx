'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/StrategyCreationProgress.module.css';
import axios from 'axios';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client

interface StrategyCreationProgressProps {
  planOutput: any[];
  imageUrl: string | null; // ✅ Add this line
  campaignData: { campaignName: string; labelOne: string; labelTwo: string } | null;
  onNext: (createdCampaignId: string | null) => void;
}


const StrategyCreationProgress: React.FC<StrategyCreationProgressProps> = ({
  planOutput,
  campaignData,
  onNext,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const createCampaignCalled = useRef<boolean>(false);
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          createCampaign(); // ✅ Call when progress hits 100%
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
      console.error('❌ User ID is missing');
      return;
    }

    try {
      console.log('🔍 Fetching campaign data from Supabase...');
      const { data: campaignData, error } = await supabase
        .from('facebook_campaign_data')
        .select('label_one, label_two, campaign_name, image_path')
        .eq('user_id', userId)
        .single();

      if (error || !campaignData) {
        console.error('❌ Error fetching campaign data from Supabase:', error);
        return;
      }

      const { label_one, label_two, campaign_name, image_path } = campaignData;

      if (!label_one || !label_two || !campaign_name || !image_path) {
        console.error('❌ Missing required fields for campaign creation');
        return;
      }

      console.log('✅ Fetched campaign data:', campaignData);
      console.log('✅ Using image URL:', image_path);

      const payload = {
        labelOne: label_one,
        labelTwo: label_two,
        campaignName: campaign_name,
        userId: userId,
        imageUrl: image_path, // ✅ Use Supabase image_path
      };

      // ✅ Send data to API
      const response = await axios.post('/api/create-campaign', payload);

      const campaignId = response.data?.adResponse?.id;
      if (campaignId) {
        console.log('✅ Campaign created successfully:', campaignId);
        onNext(campaignId); // Move to the next step with campaignId
      } else {
        console.error('❌ Campaign creation failed: No campaign ID returned');
        throw new Error('No campaign ID returned');
      }
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
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

      <center>
        <img
          src="/assets/analyzedata.svg"
          alt="Campaign Creation Icon"
          className={styles.campaignImage}
        />
      </center>
      <p>Creating your campaign...</p>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${progress}%` }}></div>
      </div>
      <p>{progress}%</p>
    </div>
  );
};

export default StrategyCreationProgress;
