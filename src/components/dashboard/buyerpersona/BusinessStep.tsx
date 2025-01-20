import React, { useState } from 'react';
import styles from './styles/BusinessStep.module.css';

interface BusinessStepProps {
  step: number;
  handleNext: () => void;
  handlePrev: () => void;
  selectedAvatar: number | null;
  handleReturnToMainMenu: () => void; // Add this prop
  age: number; // Prop for age
  setAge: (age: number) => void; // Setter for age
  location: string; // New prop for location
  setLocation: (location: string) => void; // Setter for location
  gender: string;               // Add gender as a prop
  setGender: (gender: string) => void; // Setter for gender
  language: string; // Add language prop
  setLanguage: (language: string) => void; // Add setter for language
  handleSkipInterview: () => void; // New prop for skipping to last step
}

const BusinessStep: React.FC<BusinessStepProps> = ({
  step,
  handleNext,
  handlePrev,
  selectedAvatar,
  handleReturnToMainMenu,
  age, // Use the age prop
  setAge, // Use the setter for age
  location,
  setLocation,
  gender,
  setGender,
  language,
  setLanguage,
  handleSkipInterview
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(''); // Initialize selected language state
  const [selectedGender, setSelectedGender] = useState('');

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAge(Number(event.target.value)); // Update age based on slider value
  };

  return (
    <div className={styles.wrapper}>
      {/* Left section */}
      <div className={styles.leftSection}>
        <div>
          <button className={styles.returnButton} onClick={handleReturnToMainMenu}>← RETURN TO MAIN MENU</button>
        </div>
        {selectedAvatar !== null && (
          <div className={styles.selectedAvatarLeft}>
            <img
              src={`/assets/avatar-${selectedAvatar + 1}.png`}
              alt={`Selected Avatar ${selectedAvatar + 1}`}
              className={styles.selectedAvatarImage}
            />
          </div>
        )}
        {/* Text Content */}
        <div className={styles.leftContent}>
          <h2>Why is this step important?</h2>
          <p>
            A Buyer Persona is a semi-fictional representation of your ideal customer, 
            based on market research and real data about your existing customers. The purpose of 
            creating a Buyer Persona is to gain a deeper understanding of your target audience, 
            allowing you to tailor your marketing, sales, and product strategies more effectively.
          </p>
          <p>
            For those who are just starting out and don’t have existing customers yet, this process 
            is still incredibly valuable. Even without current customers, you can create a Buyer 
            Persona based on your understanding of the market, your product or service, and who 
            you believe will benefit most from what you offer. By carefully considering who your 
            ideal customers are, you can still develop a detailed profile that will guide your 
            business decisions and marketing efforts.
          </p>
          <p>
            When answering the questions, it’s important to provide detailed and specific responses, 
            whether they are based on actual customer data or educated guesses about your target market. 
            This will help create an accurate and useful profile, regardless of whether you’re a 
            seasoned business or just getting started.
          </p>
        </div>
        {/* Page Bullet Indicator */}
        <div className={styles.circleContainer}>
          <div className={styles.circleBorder}></div>
          <div className={styles.circle}></div>
          <div className={styles.circleBorder}></div>
          <div className={styles.circleBorder}></div>
          <div className={styles.circleBorder}></div>
          <div className={styles.circleBorder}></div>
        </div>
        <div><button className={styles.backButton} onClick={handleSkipInterview}>Skip interview mode</button></div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <h1>Page 2/6: Creating the avatar</h1>

        <h2>How old is your Target Customer</h2>
        {/* Slider */}
        <div className={styles.sliderContainer}>
        <p className={styles.selectedAgeText}>{age}</p>
          <input
            type="range"
            min="18"
            max="80"
            value={age}
            onChange={handleSliderChange}
            className={styles.slider}
        /></div>

        <div className={styles.placeContainer}> 
        <h2>Where does your Target Customer live?</h2>
        <input type="text" className={styles.placeText} placeholder="Enter text here"
          value={location}
          onChange={(e) => setLocation(e.target.value)} 
        />
        </div>

        <div className={styles.languageContainer}>
          <h2>What is the primary language spoken by your Target Customer?</h2>
          <select className={styles.dropdown} 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Select a language</option>
            <option value="English">English</option>
            <option value="Filipino">Filipino</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>

        <div className={styles.radioGroup}>
          <h2>What is the gender of your Target Customer?</h2>
            {['Male', 'Female', 'Non-Binary', 'Other'].map((genderOption) => (
             <label key={genderOption} className={styles.radioLabel}>
            <input
             type="radio"
             name="gender"
             value={genderOption}
             checked={gender === genderOption} // Check if this option is selected
             onChange={() => setGender(genderOption)} // Update gender state
             className={styles.radioBox}
             />
            <span>{genderOption}</span> {/* Text next to the box */}
            </label>
             ))}
          </div>



        {/* Pagination Buttons */}
        <div className={styles.pagination}>
          <button className={styles.prevButton} onClick={handlePrev}>{"<"}</button>
          <button className={styles.nextButton} onClick={handleNext}>{">"}</button>
        </div>
      </div>
    </div>
  );
};

export default BusinessStep;
