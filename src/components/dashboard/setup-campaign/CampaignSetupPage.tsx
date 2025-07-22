'use client';

import React, { useEffect, useState } from 'react';
import StrategyCard from '@/components/dashboard/setup-campaign/StrategyCard';
import AdCreativePage from '@/components/dashboard/setup-campaign/AdCreativePage';
import CampaignNamePage from '@/components/dashboard/setup-campaign/CampaignNamePage';
import StrategyConfirmation from '@/components/dashboard/setup-campaign/StrategyConfirmation';
import StrategyCreationProgress from '@/components/dashboard/setup-campaign/StrategyCreationProgress';
import { createClient } from '../../../../utils/supabase/client';
import { useLocale } from '@/contexts/LocaleContext';

const CampaignSetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1); // Controls step navigation
  const [planOutput, setPlanOutput] = useState<any[]>([]); // Stores campaign strategies
  const [campaignData, setCampaignData] = useState<{ campaignName: string; labelOne: string; labelTwo: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null); // 🔥 Stores the uploaded image URL
  const { t } = useLocale();

  // Fetch campaign strategy & image from Supabase
  const fetchCampaignData = async () => {
    try {
      const supabase = createClient();
      const user_id = localStorage.getItem('userid');

      if (user_id) {
        const { data, error } = await supabase
          .from('facebook_campaign_data')
          .select('strategy_data, image_path')
          .eq('user_id', user_id)
          .single(); // Fetch strategy & image

        if (error) {
          console.error('❌ Error fetching campaign data:', error);
        } else {
          setPlanOutput(data?.strategy_data || []);
          setImagePath(data?.image_path || null); // ✅ Set the image URL from Supabase
        }
      } else {
        console.error('❌ User ID not found in localStorage');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch required data when the component mounts
  useEffect(() => {
    fetchCampaignData();
  }, []);

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);

  const handleCampaignCreationSuccess = (createdCampaignId: string | null) => {
    if (createdCampaignId) {
      setCampaignId(createdCampaignId);
      handleNextStep(); // Move to the next step (confirmation)
    } else {
      console.error('❌ Campaign creation failed, no campaign ID provided.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        {currentStep === 1 && <StrategyCard onNext={handleNextStep} />}
        {currentStep === 2 && <AdCreativePage onNext={handleNextStep} onBack={handlePreviousStep} />}
        {currentStep === 3 && (
          <CampaignNamePage
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            setCampaignData={setCampaignData} // Store campaign name & labels
          />
        )}
        {currentStep === 4 && (
          <StrategyCreationProgress
            planOutput={planOutput} // ✅ Strategy data
            imageUrl={imagePath} // 🔥 Fetching image from Supabase
            campaignData={campaignData} // ✅ Campaign name & labels
            onNext={handleCampaignCreationSuccess} // Move to the next step
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 5 && <StrategyConfirmation campaignId={campaignId} />}
      </div>
    </div>
  );
};

export default CampaignSetupPage;
