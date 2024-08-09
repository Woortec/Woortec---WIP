'use client';

import React, { useEffect, useState } from 'react';
import PlanOutputUpload from './PlanOutputUpload';
import ImageUpload from './ImageUpload';
import CampaignName from './CampaignName';
import styles from './styles/CampaignSetup.module.css';

const CampaignSetup: React.FC = () => {
  const [planOutput, setPlanOutput] = useState<any>(null);
  const [image, setImage] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState({ labelOne: '', labelTwo: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { component: PlanOutputUpload, props: { onUpload: setPlanOutput }, label: 'Upload Plan Output' },
    { component: ImageUpload, props: { onUpload: setImage }, label: 'Upload Image' },
    { component: CampaignName, props: { onSetName: (labelOne: string, labelTwo: string) => setCampaignName({ labelOne, labelTwo }) }, label: 'Set Campaign Name' },
  ];

  useEffect(() => {
    const uploadCampaign = async () => {
      if (planOutput && image && campaignName.labelOne && campaignName.labelTwo) {
        console.log("uploadCampaign function is being called."); // Log function start
        console.log('Final planOutput before sending:', planOutput);
  
        setIsProcessing(true);
  
        // Fetching data from local storage
        const accessToken = localStorage.getItem('accessToken');
        const adAccountId = localStorage.getItem('adAccountId');
        const pageId = localStorage.getItem('pageId');
  
        console.log('Local storage data:', { accessToken, adAccountId, pageId });
  
        if (!accessToken || !adAccountId || !pageId) {
          console.error('Required data is missing in local storage.');
          setIsProcessing(false);
          return;
        }
  
        // Log campaignDetails to check its structure
        console.log('Campaign Details:', planOutput.campaignDetails);
  
        // Extract adLink from campaignDetails inside planOutput
        const adLink = planOutput.campaignDetails?.adLink;
        if (!adLink) {
          console.error('adLink is missing in campaignDetails.');
          alert('The uploaded file is missing adLink. Please ensure the file contains this field.');
          setIsProcessing(false);
          return;
        }
  
        const formData = new FormData();
        formData.append('accessToken', accessToken);
        formData.append('adAccountId', adAccountId);
        formData.append('pageId', pageId);
        formData.append('planOutput', JSON.stringify(planOutput));
        formData.append('image', image);
        formData.append('labelOne', campaignName.labelOne);
        formData.append('labelTwo', campaignName.labelTwo);
  
        try {
          console.log('Attempting to send API request...');
          const response = await fetch('/api/create-campaign', {
            method: 'POST',
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
  
          const result = await response.json();
          console.log('Campaign creation result:', result);
        } catch (error) {
          console.error('Error creating campaign:', error);
        } finally {
          setIsProcessing(false);
        }
      } else {
        console.log('Form data is incomplete:', { planOutput, image, campaignName });
      }
    };
  
    if (activeStep === steps.length) {
      console.log("All steps completed, calling uploadCampaign"); // Log when all steps are completed
      uploadCampaign();
    } else {
      console.log("Waiting for all steps to complete... Current active step:", activeStep);
    }
  }, [activeStep, planOutput, image, campaignName]);

  const handleNext = () => {
    console.log("Next button clicked. Current step:", activeStep);
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    console.log("Back button clicked. Current step:", activeStep);
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const StepComponent = steps[activeStep]?.component || null;
  const stepProps = steps[activeStep]?.props || {};

  return (
    <div className={styles.container}>
      <div className={styles.stepper}>
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`${styles.step} ${index === activeStep ? styles.activeStep : ''}`}
          >
            {step.label}
          </div>
        ))}
      </div>
      {isProcessing ? (
        <div className={styles.container}>
          <p>Processing your Campaign Setup...</p>
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: '72%' }}></div>
          </div>
        </div>
      ) : (
        <div className={styles.stepContent}>
          {StepComponent && <StepComponent {...stepProps} />}
          <div className={styles.buttons}>
            <button onClick={handleBack} disabled={activeStep === 0}>
              Back
            </button>
            <button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSetup;
