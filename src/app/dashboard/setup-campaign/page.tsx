'use client';

import React, { useEffect, useState } from 'react';
import StrategyCard from '@/components/dashboard/setup-campaign/StrategyCard';
import AdCreativePage from '@/components/dashboard/setup-campaign/AdCreativePage';
import CampaignNamePage from '@/components/dashboard/setup-campaign/CampaignNamePage';
import StrategyConfirmation from '@/components/dashboard/setup-campaign/StrategyConfirmation';
import StrategyCreationProgress from '@/components/dashboard/setup-campaign/StrategyCreationProgress';
import { createClient } from '../../../../utils/supabase/client'; // Supabase client

const CampaignSetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [planOutput, setPlanOutput] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [campaignData, setCampaignData] = useState<{
    campaignName: string;
    labelOne: string;
    labelTwo: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const [hasPlan, setHasPlan] = useState<boolean>(false);
  const [planLoading, setPlanLoading] = useState<boolean>(true);

  // Fetch the campaign strategy data stored in Supabase
  const fetchPlanOutput = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const user_id = user.id;
        const { data, error } = await supabase
          .from('facebook_campaign_data')
          .select('strategy_data')
          .eq('user_id', user_id)
          .single();

        if (error) {
          console.error('Error fetching plan output:', error);
        } else {
          setPlanOutput(data?.strategy_data || []);
        }
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if the user has a planId
  const checkUserPlan = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const user_id = user.id;
        const { data, error } = await supabase
          .from('user') // Or 'users' if that's your table name
          .select('planId')
          .eq('uuid', user_id) // Use the correct UUID column
          .single();

        if (error) {
          console.error('Error fetching planId:', error);
        } else {
          setHasPlan(!!data?.planId);
        }
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setPlanLoading(false);
    }
  };

  // Fetch required data when the component mounts
  useEffect(() => {
    fetchPlanOutput();
    checkUserPlan();
  }, []);

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);

  const handleCampaignCreationSuccess = (createdCampaignId: string | null) => {
    if (createdCampaignId) {
      setCampaignId(createdCampaignId);
      handleNextStep();
    } else {
      console.error('Campaign creation failed, no campaign ID provided.');
    }
  };

  if (loading || planLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ filter: hasPlan ? 'none' : 'blur(5px)' }}>
        {currentStep === 1 && <StrategyCard onNext={handleNextStep} />}
        {currentStep === 2 && (
          <AdCreativePage
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            setImageFile={setImageFile}
          />
        )}
        {currentStep === 3 && (
          <CampaignNamePage
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            setCampaignData={setCampaignData}
          />
        )}
        {currentStep === 4 && (
          <StrategyCreationProgress
            planOutput={planOutput}
            imageFile={imageFile}
            campaignData={campaignData}
            onNext={handleCampaignCreationSuccess}
          />
        )}
        {currentStep === 5 && <StrategyConfirmation campaignId={campaignId} />}
      </div>
      {!hasPlan && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '20px',
              borderRadius: '8px',
              pointerEvents: 'auto',
              textAlign: 'center',
            }}
          >
            <p>You need to subscribe in order to use our services</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSetupPage;
