'use client'

import React, { useState } from 'react';
import CampaignDetailsForm from './CampaignDetailsForm';
import PhotoUploadForm from './PhotoUploadForm';
import CampaignNameForm from './CampaignNameForm';
import styles from './styles/CampaignForm.module.css';

const CampaignSetup: React.FC = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const complete = () => {
    // Handle the completion of the campaign setup, e.g., save data or navigate to another page
    console.log('Campaign setup complete');
  };

  return (
    <div className={styles.container}>
      {step === 1 && <CampaignDetailsForm nextStep={nextStep} />}
      {step === 2 && <PhotoUploadForm nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <CampaignNameForm prevStep={prevStep} complete={complete} />}
    </div>
  );
};

export default CampaignSetup;
