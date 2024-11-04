import React, { useState } from 'react';
import styles from './styles/CharacteristicsStep.module.css';

interface CharacteristicsStepProps {
  handleNext: () => void;
  handlePrev: () => void; // Add prop for handlePrev
  selectedAvatar: number | null; // Add prop for selectedAvatar
  handleReturnToMainMenu: () => void; // Add this prop
  goals: string;
  setGoals: (goals: string) => void; // Add setter function
  challenges: string;
  setChallenges: (challenges: string) => void; // Add setter function
  purchase: string;
  setPurchase: (purchase: string) => void; // Add setter function
  handleSkipInterview: () => void; // New prop for skipping to last step
}

const CharacteristicsStep: React.FC<CharacteristicsStepProps> = ({handleNext, handlePrev, selectedAvatar, 
  handleReturnToMainMenu,
  goals,
  setGoals,
  challenges,
  setChallenges,
  purchase,
  setPurchase,
  handleSkipInterview
}) => {

  return (
<div className={styles.wrapper}>
      {/* Left section */}
      <div className={styles.leftSection}>
      <div><button className={styles.returnButton} onClick={handleReturnToMainMenu}>← RETURN TO MAIN MENU</button></div>
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
      <div className={styles.circleBorder}></div>
      <div className={styles.circleBorder}></div>
      <div className={styles.circleBorder}></div>
      <div className={styles.circle}></div>
      <div className={styles.circleBorder}></div>
    </div>
    <div><button className={styles.backButton} onClick={handleSkipInterview}>Skip interview mode</button></div>
  </div>

      {/* Right section */}
      <div className={styles.rightSection}>
        <h1 className={styles.pageTitle}>Page 5/6: Creating the avatar</h1>
        {/* Right section content */}
        <div> 
        <h2 className={styles.placeHeader}>What are the primary goals and motivations of your Target Customer in their professional and personal life?</h2>
        <textarea className={styles.placeText} placeholder="(Identify the specific websites or types of websites frequently browsed)"
                                         value={goals} 
                                         onChange={(e) => setGoals(e.target.value)}
        />
        </div>

        <div> 
        <h2 className={styles.placeHeader}>What are the main challenges or obstacles faced by your Target Customer?</h2>
        <textarea className={styles.placeText} placeholder="(Explain the difficulties they encounter, such as time management, budget constraints, or skill gaps.)"
                                        value={challenges} 
                                        onChange={(e) => setChallenges(e.target.value)} 
        />
        </div>

        <div> 
        <h2 className={styles.placeHeader}>What concerns or objections might your Target Customer have when considering a purchase?</h2>
        <textarea className={styles.placeText} placeholder="(Mention specific reasons they might hesitate, such as cost, product reliability, or customer support.)"
                                        value={purchase} 
                                         onChange={(e) => setPurchase(e.target.value)} 
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

export default CharacteristicsStep;
