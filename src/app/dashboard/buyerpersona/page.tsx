'use client'

import React, { useState } from 'react';
import AvatarStep from '@/components/dashboard/buyerpersona/AvatarStep';
import BusinessStep from '@/components/dashboard/buyerpersona/BusinessStep';
import CharacteristicsStep from '@/components/dashboard/buyerpersona/CharacteristicsStep';
import ToolsStep from '@/components/dashboard/buyerpersona/ToolsStep';
import ConsumptionHabitsStep from '@/components/dashboard/buyerpersona/ConsumptionHabitsStep';
import ProfessionalPathStep from '@/components/dashboard/buyerpersona/ProfessionalPathStep';
import DemographicStep from '@/components/dashboard/buyerpersona/DemographicStep';

const App: React.FC = () => {
  const [step, setStep] = useState(1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <AvatarStep />;
      case 2:
        return <DemographicStep />;
      case 3:
        return <BusinessStep />;
      case 4:
        return <ProfessionalPathStep />;
      case 5:
        return <CharacteristicsStep />;
      case 6:
        return <ToolsStep />;
      case 7:
        return <ConsumptionHabitsStep />;
      default:
        return <AvatarStep />;
    }
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  return (
    <div>
      {renderStep()}
      <button onClick={handleNext} className="nextButton">Siguiente</button>
    </div>
  );
};

export default App;
