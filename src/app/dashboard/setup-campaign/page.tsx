'use client';

import React, { useEffect, useState } from 'react';
import StrategyCard from '@/components/dashboard/setup-campaign/StrategyCard';
import AdCreativePage from '@/components/dashboard/setup-campaign/AdCreativePage';
import CampaignNamePage from '@/components/dashboard/setup-campaign/CampaignNamePage';
import StrategyConfirmation from '@/components/dashboard/setup-campaign/StrategyConfirmation';
import StrategyCreationProgress from '@/components/dashboard/setup-campaign/StrategyCreationProgress';
import { createClient } from '../../../../utils/supabase/client'; // Supabase client
import {Box, Typography, Button} from '@mui/material';
import { SketchLogo as DiamondIcon } from '@phosphor-icons/react/dist/ssr/SketchLogo';
import './page.css'; // Import the CSS file for styles

const CampaignSetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [planOutput, setPlanOutput] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
  onNext={(uploadedImageUrl: string) => {
    setImageUrl(uploadedImageUrl); // Make sure you store the URL if necessary
    handleNextStep(); // Move to the next step
  }}
  onBack={handlePreviousStep}
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
            imageUrl={imageUrl}
            campaignData={campaignData}
            onNext={handleCampaignCreationSuccess}
          />
        )}
        {currentStep === 5 && <StrategyConfirmation campaignId={campaignId} />}
      </div>
      {!hasPlan && (
        <div className="cta-overlay">
          <Box className="cta-container">
            <Box className="leftC" sx={{display:'flex', flexDirection: 'column'}}>
            <h2 className="header"><Box sx={{borderRadius:'50%', padding:'0.3rem', bgcolor:'#F1E400'}}><DiamondIcon></DiamondIcon></Box>
            Unlock Full Access</h2>
            <Box className="description">
              <p>
                Subscribe now to access premium tools and strategy insights that will help you elevate your skills and make smarter decisions.
                By subscribing, you will gain access to:
              </p>
              <ul>
                <li>Exclusive Tools designed to enhance your workflow and maximize productivity.</li>
                <li>Comprehensive Strategy Insights that offer actionable advice, data-driven recommendations, and best practices.</li>
                <li>Early Access to new features, updates, and content to stay ahead of the curve.</li>
                <li>Community Engagement with like-minded individuals, sharing knowledge, tips, and experiences to help each other succeed.</li>
              </ul>
              <p>
                This is your chance to get ahead—transform your approach and unlock your full potential with premium features you won’t find anywhere else!
              </p>
            </Box>

            <Box sx={{ display: 'flex', padding: '2rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f1f1', }}>
                <button className="cta-button">Subscribe Now</button></Box>
            </Box> {/*Left Column*/}
            <Box className="rightC"> {/*Right Column*/}
            <img src="/assets/ads-strategies.svg" alt="Unlock Access" className="cta-image" />
            </Box>
          </Box>
          <button className="close-btn">X</button>
        </div>
      )}
    </div>
  );
};

export default CampaignSetupPage;
