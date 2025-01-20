'use client';

import React, { useState } from 'react';
import AvatarStep from '@/components/dashboard/buyerpersona/AvatarStep';
import BusinessStep from '@/components/dashboard/buyerpersona/BusinessStep';
import CharacteristicsStep from '@/components/dashboard/buyerpersona/CharacteristicsStep';
import ToolsStep from '@/components/dashboard/buyerpersona/ToolsStep';
import ConsumptionHabitsStep from '@/components/dashboard/buyerpersona/ConsumptionHabitsStep';
import ProfessionalPathStep from '@/components/dashboard/buyerpersona/ProfessionalPathStep';
import DemographicStep from '@/components/dashboard/buyerpersona/DemographicStep';
import FinalAvatarStep from '@/components/dashboard/buyerpersona/FinalAvatarStep';
import InfoBuyerPersona from '@/components/dashboard/buyerpersona/InfoBuyerPersona';


const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null); // Lifted state
  
  // For Customer Name
  const [customerName, setCustomerName] = useState(''); // New state for input value
  const handleNameChange = (newName: string) => {
    setCustomerName(newName); // Update the state with the new value
  };

  // For age
  const [age, setAge] = useState<number>(18); // Add age state

  // For Location
  const [location, setLocation] = useState('');
  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  // For Job
  const [job, setJob] = useState('');
  const handleJobChange = (newJob: string) => {
    setJob(newJob);
  };

  // For Checkboxes Socmed
  const [selectedSocmed, setSelectedSocmed] = useState<string[]>([]);
  const handleSocmedChange = (newSelected: string[]) => {
    setSelectedSocmed(newSelected); // Update the state with the new array
  };

  // For Gender
  const [gender, setGender] = useState<string>('');

  const [language, setLanguage] = useState<string>(''); // Initialize language state

  const [education, setEducation] = useState<string>('');

  // For Income
  const [annualIncome, setAnnualIncome] = useState(''); // New state for input value
  const handleIncomeChange = (newAnnualIncome: string) => {
    setAnnualIncome(newAnnualIncome); // Update the state with the new value
  };

// For website visited
const [website, setWebsite] = useState(''); // New state for input value
const handleWebsiteChange = (newWebsite: string) => {
  setWebsite(newWebsite); // Update the state with the new value
};

// For customer read
const [read, setRead] = useState(''); // New state for input value
const handleReadChange = (newRead: string) => {
  setRead(newRead); // Update the state with the new value
};

// For customer read
const [genre, setGenre] = useState(''); // New state for input value
const handleMovieGenreChange = (newGenre: string) => {
  setGenre(newGenre); // Update the state with the new value
};

// For goals and motivations
const [goals, setGoals] = useState(''); // New state for input value
const handleGoalsChange = (newGoals: string) => {
  setGoals(newGoals); // Update the state with the new value
};

// For challenges
const [challenges, setChallenges] = useState(''); // New state for input value
const handleChallengesChange = (newChallenges: string) => {
  setChallenges(newChallenges); // Update the state with the new value
};

// For purchase
const [purchase, setPurchase] = useState(''); // New state for input value
const handlePurchaseChange = (newPurchase: string) => {
  setPurchase(newPurchase); // Update the state with the new value
};

// For hobbies
const [hobbies, setHobbies] = useState(''); // New state for input value
const handleHobbiesChange = (newHobbies: string) => {
  setHobbies(newHobbies); // Update the state with the new value
};

// For skills
const [skill, setSkill] = useState(''); // New state for input value
const handleSkillChange = (newSkill: string) => {
  setSkill(newSkill); // Update the state with the new value
};

// For social media
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const handleReturnToMainMenu = () => {
    setStep(1); // Navigate back to the first page
  };

  const handleSkipInterview = () => {
    setStep(8); // Navigate back to the first page
  };

  const handleInfoBuyerPersona = () => {
    setStep(9); // Navigate back to the first page
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <AvatarStep 
          step={step}
          handleNext={handleNext}
          handleInfoBuyerPersona={handleInfoBuyerPersona}
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
            handleReturnToMainMenu={handleReturnToMainMenu}
            handleSkipInterview={handleSkipInterview}
          />
        );
      case 3:
        return (
          <BusinessStep
            step={step}
            handleNext={handleNext}
            handlePrev={handlePrev} // Add handlePrev here
            selectedAvatar={selectedAvatar} // Pass selectedAvatar
            age={age} // Pass age to BusinessStep
            setAge={setAge} // Pass setter for age
            handleReturnToMainMenu={handleReturnToMainMenu}
            location={location} // Pass the location state
            setLocation={setLocation} // Pass the setter function for location
            gender={gender}             // Pass down the gender state
            setGender={setGender}       // Pass down the setGender function
            language={language}
            setLanguage={setLanguage}
            handleSkipInterview={handleSkipInterview}
          />
        );
      case 4:
        return (
          <ToolsStep
            handleNext={handleNext} // Add handleNext for ToolsStep if needed
            handlePrev={handlePrev} // Add handlePrev here
            selectedAvatar={selectedAvatar} // Pass selectedAvatar
            handleReturnToMainMenu={handleReturnToMainMenu}
            job={job} 
            setJob={setJob} // Pass the setter function
            education={education} 
            setEducation={setEducation} 
            annualIncome={annualIncome} 
            setAnnualIncome={setAnnualIncome} // Pass the setter function
            handleSkipInterview={handleSkipInterview}
          />
        );
      case 5:
        return (
          <ProfessionalPathStep
            handlePrev={handlePrev} // Add handlePrev here
            selectedAvatar={selectedAvatar} // Pass selectedAvatar
            handleReturnToMainMenu={handleReturnToMainMenu}
            handleNext={handleNext}
            website={website} // Pass down website state
            setWebsite={setWebsite} // Pass down setWebsite function
            read={read} 
            setRead={setRead} 
            genre={genre} 
            setGenre={setGenre} 
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
            handleSkipInterview={handleSkipInterview}
          />
        );
        case 6:
          return (
            <CharacteristicsStep
              handleNext={handleNext} // Add handleNext for CharacteristicsStep if needed
              handlePrev={handlePrev} // Add handlePrev here
              selectedAvatar={selectedAvatar} // Pass selectedAvatar
              handleReturnToMainMenu={handleReturnToMainMenu}
              goals={goals} 
              setGoals={setGoals}
              challenges={challenges} 
              setChallenges={setChallenges}
              purchase={purchase} 
              setPurchase={setPurchase}
              handleSkipInterview={handleSkipInterview}
            />
          );
          case 7:
            return (
              <ConsumptionHabitsStep
                handleNext={handleNext} // Add handleNext for CharacteristicsStep if needed
                handlePrev={handlePrev} // Add handlePrev here
                selectedAvatar={selectedAvatar} // Pass selectedAvatar
                handleReturnToMainMenu={handleReturnToMainMenu}
                hobbies={hobbies}
                setHobbies={setHobbies}
                skill={skill}
                setSkill={setSkill}
                handleSkipInterview={handleSkipInterview}
              />
            );
            case 8:
              return <FinalAvatarStep
              selectedAvatar={selectedAvatar}
              customerName={customerName}
              age={age}
              location={location}
              gender={gender}
              setAge={setAge}
              setGender={setGender}
              language={language}
              setLanguage={setLanguage}
              job={job}
              education={education}
              setEducation={setEducation}
              annualIncome={annualIncome}
              setAnnualIncome={setAnnualIncome}
              handleReturnToMainMenu={handleReturnToMainMenu}
              handleNameChange={handleNameChange}
              handleLocationChange={handleLocationChange}
              handleJobChange={handleJobChange}
              website={website}
              setWebsite={setWebsite}
              read={read} 
              setRead={setRead} 
              genre={genre} 
              setGenre={setGenre} 
              goals={goals} 
              setGoals={setGoals}
              challenges={challenges} 
              setChallenges={setChallenges}
              purchase={purchase} 
              setPurchase={setPurchase}
              hobbies={hobbies}
              setHobbies={setHobbies}
              skill={skill}
              setSkill={setSkill}
              selectedPlatforms={selectedPlatforms}
              setSelectedPlatforms={setSelectedPlatforms}
            />

            case 9:
              return <InfoBuyerPersona 
              handleReturnToMainMenu={handleReturnToMainMenu}
              
            />;
      // Add cases for other steps...
      default:
        return null; // Handle default case
    }
  };

  const handleNext = () => {
    if (step < 9) setStep(step + 1);
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
