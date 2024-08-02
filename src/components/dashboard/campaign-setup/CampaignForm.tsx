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

  return (
    <div className={styles.container}>
      {step === 1 && <CampaignDetailsForm nextStep={nextStep} />}
      {step === 2 && <PhotoUploadForm nextStep={nextStep} prevStep={prevStep} />}
      {step === 3 && <CampaignNameForm prevStep={prevStep} />}
    </div>
  );
};

export default CampaignSetup;
