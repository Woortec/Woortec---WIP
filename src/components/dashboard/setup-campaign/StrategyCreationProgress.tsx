'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/StrategyCreationProgress.module.css';
import axios from 'axios';
import { createClient } from '../../../../utils/supabase/client'; // Import Supabase client
import { useLocale } from '@/contexts/LocaleContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

interface StrategyCreationProgressProps {
  planOutput: any[];
  imageUrl: string | null; // ✅ Add this line
  campaignData: { campaignName: string; labelOne: string; labelTwo: string } | null;
  onNext: (createdCampaignId: string | null) => void;
  setCurrentStep: (step: number) => void;
}


const   StrategyCreationProgress: React.FC<StrategyCreationProgressProps> = ({
  planOutput,
  campaignData,
  onNext,
  setCurrentStep,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const createCampaignCalled = useRef<boolean>(false);
  const supabase = createClient();
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

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

      console.log(response);
      const campaignId = response.data?.adResponse?.id;
      if (campaignId) {
        console.log('✅ Campaign created successfully:', campaignId);
        onNext(campaignId); // Move to the next step with campaignId
      } 
      else if(response.data.message){
        console.error('❌ Campaign creation failed:', response.data.message);
        setError(response.data.message);
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }
       else {
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
      <h1 className={styles.headerLabel}>{t('CampaignSetup.strategyCreationProgress.title')}</h1>
      <div className={styles.description}>
        {t('CampaignSetup.strategyCreationProgress.subtitle')}
      </div>

      <center>
        <img
          src="/assets/analyzedata.svg"
          alt="Campaign Creation Icon"
          className={styles.campaignImage}
        />
      </center>
      <p>{t('CampaignSetup.strategyCreationProgress.creatingCampaign')}</p>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${progress}%` }}></div>
      </div>
      <p>{t('CampaignSetup.strategyCreationProgress.percentComplete').replace('{progress}', progress.toString())}</p>
      <Snackbar
        key={error}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          setOpenSnackbar(false);
          setError(null);
          if (typeof setCurrentStep === 'function') {
            setCurrentStep(1);
          }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert elevation={6} variant="filled" severity="error" sx={{ width: '100%' }}>
          {error}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default StrategyCreationProgress;

