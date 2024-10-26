'use client';

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
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null); // Lifted state
  const [customerName, setCustomerName] = useState(''); // New state for input value

  const renderStep = () => {
    switch (step) {
      case 1:
        return <AvatarStep 
          step={step}
          handleNext={handleNext}
        />;
      case 2:
        return (
          <DemographicStep
            step={step}
            handleNext={handleNext}
            selectedAvatar={selectedAvatar} // Pass selectedAvatar
            setSelectedAvatar={setSelectedAvatar} // Pass setter function
            customerName={customerName} // Pass the customerName
            setCustomerName={setCustomerName} // Pass the setter function
          />
        );
      case 3:
        return (
          <BusinessStep
            step={step}
            handleNext={handleNext}
            handlePrev={handlePrev} // Add handlePrev here
            selectedAvatar={selectedAvatar} // Pass selectedAvatar
          />
        );
      case 4:
        return (
          <ToolsStep
            handleNext={handleNext} // Add handleNext for ToolsStep if needed
            handlePrev={handlePrev} // Add handlePrev here
            selectedAvatar={selectedAvatar} // Pass selectedAvatar
          />
        );
      case 5:
        return (
          <ProfessionalPathStep
            handleNext={handleNext} // Add handleNext for ProfessionalPathStep if needed
            handlePrev={handlePrev} // Add handlePrev here
            selectedAvatar={selectedAvatar} // Pass selectedAvatar
          />
        );
        case 6:
          return (
            <CharacteristicsStep
              handleNext={handleNext} // Add handleNext for CharacteristicsStep if needed
              handlePrev={handlePrev} // Add handlePrev here
              selectedAvatar={selectedAvatar} // Pass selectedAvatar
            />
          );
          case 7:
            return (
              <ConsumptionHabitsStep
                handleNext={handleNext} // Add handleNext for CharacteristicsStep if needed
                handlePrev={handlePrev} // Add handlePrev here
                selectedAvatar={selectedAvatar} // Pass selectedAvatar
              />
            );
      // Add cases for other steps...
      default:
        return null; // Handle default case
    }
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default App;
