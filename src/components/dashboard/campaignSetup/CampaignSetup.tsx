'use client';

import React, { useEffect, useState } from 'react';
import PlanOutputUpload from './PlanOutputUpload';
import ImageUpload from './ImageUpload';
import CampaignName from './CampaignName';
import styles from './styles/CampaignSetup.module.css';

type PlanOutputUploadProps = {
  onUpload: (output: any) => void;
};

type ImageUploadProps = {
  onUpload: (image: File | null) => void;
};

type CampaignNameProps = {
  onSetName: (labelOne: string, labelTwo: string) => void;
};

const CampaignSetup: React.FC = () => {
  const [planOutput, setPlanOutput] = useState<any>(null);
  const [image, setImage] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState({ labelOne: '', labelTwo: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps: { component: React.FC<any>; props: any; label: string }[] = [
    { 
      component: PlanOutputUpload, 
      props: { onUpload: setPlanOutput }, 
      label: 'Upload Plan Output' 
    },
    { 
      component: ImageUpload, 
      props: { onUpload: setImage }, 
      label: 'Upload Image' 
    },
    { 
      component: CampaignName, 
      props: { onSetName: (labelOne: string, labelTwo: string) => setCampaignName({ labelOne, labelTwo }) }, 
      label: 'Set Campaign Name' 
    },
  ];

  useEffect(() => {
    const uploadCampaign = async () => {
      if (planOutput && image && campaignName.labelOne && campaignName.labelTwo) {
        setIsProcessing(true);

        // Fetch data from local storage
        const accessToken = localStorage.getItem('accessToken');
        const adAccountId = localStorage.getItem('adAccountId');
        const pageId = localStorage.getItem('pageId');

        if (!accessToken || !adAccountId || !pageId) {
          console.error('Required data is missing in local storage.');
          setIsProcessing(false);
          return;
        }

        // Extract adLink and adMessage from planOutput
        const { adLink, adMessage } = planOutput;

        if (!adLink || !adMessage) {
          console.error('adLink or adMessage is missing in planOutput.');
          setIsProcessing(false);
          return;
        }

        const formData = new FormData();
        formData.append('accessToken', accessToken);
        formData.append('adAccountId', adAccountId);
        formData.append('pageId', pageId);
        formData.append('adMessage', adMessage);
        formData.append('adLink', adLink);
        formData.append('planOutput', JSON.stringify(planOutput));
        formData.append('image', image);
        formData.append('labelOne', campaignName.labelOne);
        formData.append('labelTwo', campaignName.labelTwo);

        try {
          console.log('Sending campaign data...');
          const response = await fetch('/api/create-campaign', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Campaign creation result:', result);

          // Add success handling, e.g., redirect or display a message
        } catch (error) {
          console.error('Error creating campaign:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    if (activeStep === steps.length) {
      uploadCampaign();
    }
  }, [activeStep, planOutput, image, campaignName]);

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
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
