import React, { useState } from 'react';
import styles from './styles/ConsumptionHabitsStep.module.css';

interface ConsumptionHabitsStepProps {
  handleNext: () => void;
  handlePrev: () => void; // Add prop for handlePrev
  selectedAvatar: number | null; // Add prop for selectedAvatar
}

const ConsumptionHabitsStep: React.FC<ConsumptionHabitsStepProps> = ({handleNext, handlePrev, selectedAvatar }) => {
  const [age, setAge] = useState<number>(25); // Initialize age state

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAge(Number(event.target.value)); // Update age based on slider value
  };

  return (
<div className={styles.wrapper}>
      {/* Left section */}
      <div className={styles.leftSection}>
      <div><button className={styles.returnButton}>RETURN TO MAIN MENU</button></div>
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
      <div className={styles.circleBorder}></div>
      <div className={styles.circle}></div>
    </div>
    <div><button className={styles.backButton}>Skip interview mode</button></div>
  </div>

      {/* Right section */}
      <div className={styles.rightSection}>
        <h1 className={styles.pageTitle}>Page 6/6: Creating the avatar</h1>
        {/* Right section content */}
        <div> 
        <h2 className={styles.placeHeader}>What are the hobbies or activities that your Target Customer enjoys in their free time?</h2>
        <textarea className={styles.placeText} placeholder="(Identify the specific websites or types of websites frequently browsed)"/>
        </div>

        <div> 
        <h2 className={styles.placeHeader}>What skills has your Target Customer developed that are valuable in their personal or professional life?</h2>
        <textarea className={styles.placeText} placeholder="(Describe specific skills like project management, creative writing, coding, etc.)"/>
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

export default ConsumptionHabitsStep;
