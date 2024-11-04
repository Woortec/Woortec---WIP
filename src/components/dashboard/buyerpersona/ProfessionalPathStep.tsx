import React, {useEffect, useState } from 'react';
import styles from './styles/ProfessionalPathStep.module.css';

interface ProfessionalPathStepProps {
  handleNext: () => void;
  handlePrev: () => void; // Add prop for handlePrev
  selectedAvatar: number | null; // Add prop for selectedAvatar
  handleReturnToMainMenu: () => void; // Add this prop
  website: string; // Add this line
  setWebsite: (website: string) => void; // Add this line
  read: string; // Add this line
  setRead: (read: string) => void; // Add this line
  genre: string; // Add this line
  setGenre: (genre: string) => void; // Add this line
  selectedPlatforms: string[]; // Ensure it's an array of strings
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>; // Correct type for the setter
  handleSkipInterview: () => void; // New prop for skipping to last step
}

const ProfessionalPathStep: React.FC<ProfessionalPathStepProps> = ({handleNext, handlePrev, selectedAvatar, handleReturnToMainMenu,
  website,
  setWebsite,
  read,
  setRead,
  genre,
  setGenre,
  selectedPlatforms,
  setSelectedPlatforms,
  handleSkipInterview
 }) => {

  // Handler for checkbox change
  const handleCheckboxChange = (socmed: string) => {
    setSelectedPlatforms((prev: string[]) => {
      if (prev.includes(socmed)) {
        // Remove the platform if already selected
        return prev.filter(item => item !== socmed);
      } else {
        // Add the platform if not selected
        return [...prev, socmed];
      }
    });
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
          {/* Bullets */}
        </div>
        <div><button className={styles.backButton} onClick={handleSkipInterview}>Skip interview mode</button></div>
      </div>

      {/* Right section */}
      <div className={styles.rightSection}>
        <h1 className={styles.pageTitle}>Page 4/6: Creating the avatar</h1>
        {/* Right section content */}
        <div className={styles.radioGroup}>
          <h2>Which social media platforms does your Target Customer use most frequently?</h2>
          {['Facebook', 'Instagram', 'Tiktok', 'Other'].map((socmed) => (
            <label key={socmed} className={styles.radioLabel}>
              <input
                type="checkbox"
                name="socmed"
                className={styles.radioBox}
                checked={selectedPlatforms.includes(socmed)}
                onChange={() => handleCheckboxChange(socmed)}
              />
              <span>{socmed}</span> {/* Text next to the box */}
            </label>
          ))}
        </div>

        {/* Additional questions */}
        <div> 
          <h2 className={styles.placeHeader}>What websites does your Target Customer visit most often?</h2>
          <input type="text" className={styles.placeText} placeholder="(Identify the specific websites or types of websites frequently browsed)"
             value={website} // Use the website prop
              onChange={(e) => setWebsite(e.target.value)} // Use setWebsite prop
          />
        </div>

        <div> 
          <h2 className={styles.placeHeader}>Which magazines or newspapers does your Target Customer read regularly?</h2>
          <input type="text" className={styles.placeText} placeholder="(Mention both digital and print publications that are subscribed to or read often.)"
                       value={read} // Use the website prop
                       onChange={(e) => setRead(e.target.value)} // Use setWebsite prop
          />
        </div>

        <div> 
          <h2 className={styles.placeHeader}>What are the favorite movies or film genres of your Target Customer?</h2>
          <input type="text" className={styles.placeText} placeholder="(Indicate specific movies, genres, or types of content that are enjoyed.)"
                                 value={genre} // Use the website prop
                                 onChange={(e) => setGenre(e.target.value)} // Use setWebsite prop
          />
        </div>

        {/* Pagination buttons */}
        <div className={styles.pagination}>
          <button className={styles.prevButton} onClick={handlePrev}>{"<"}</button>
          <button className={styles.nextButton} onClick={handleNext}>{">"}</button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPathStep;
