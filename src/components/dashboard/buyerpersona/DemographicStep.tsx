'use client';

import React from 'react';
import styles from './styles/DemographicStep.module.css';

interface DemographicStepProps {
  step: number;
  handleNext: () => void;
  selectedAvatar: number | null; // Add prop for selectedAvatar
  setSelectedAvatar: (index: number | null) => void; // Add prop for setter
  customerName: string; // Add prop for customer name
  setCustomerName: (name: string) => void; // Add setter function
}

const DemographicStep: React.FC<DemographicStepProps> = ({ 
  step, 
  handleNext, 
  selectedAvatar, 
  setSelectedAvatar, 
  customerName, 
  setCustomerName 
}) => {
  const avatarFilenames = [
    'avatar-1.png',
    'avatar-2.png',
    'avatar-3.png',
    'avatar-4.png',
    'avatar-5.png'
  ];

  const handleAvatarClick = (index: number) => {
    setSelectedAvatar(index); // Update selectedAvatar
  };

  // Handle form submission
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission
    const form = event.currentTarget;

    if (form.checkValidity()) {
      handleNext(); // Call handleNext only if the form is valid
    } else {
      form.reportValidity(); // Show validation errors
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Left section */}
      <div className={styles.leftSection}>
        <div><button className={styles.returnButton}>RETURN TO MAIN MENU</button></div>
        {selectedAvatar === null ? (
          <div className={styles.placeholderCircle}>?</div> // Placeholder when no avatar is selected
        ) : (
          <div className={`${styles.selectedAvatarLeft} ${styles.fadeIn}`}>
            <img
              src={`/assets/${avatarFilenames[selectedAvatar]}`}
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
          <div className={styles.circle}></div>
          <div className={styles.circleBorder}></div>
          <div className={styles.circleBorder}></div>
          <div className={styles.circleBorder}></div>
          <div className={styles.circleBorder}></div>
          <div className={styles.circleBorder}></div>
        </div>
        <div><button className={styles.backButton}>Skip interview mode</button></div>
      </div>

      {/* Right section */}
      <div className={styles.rightSection}>
        <h1>Page 1/6: Creating the avatar</h1>
        <h2>What is the name of your Target Customer?</h2>
        <form onSubmit={handleFormSubmit}> {/* Add a form element here */}
          <input 
            className={styles.textInput} 
            type="text" 
            placeholder="Assign a name to the buyer persona" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)} 
            required // This ensures the input is required
          />
          
          <h3 className={styles.avatarTitle}>Select an avatar</h3>
          <div className={styles.avatarGrid}>
            {avatarFilenames.map((filename, index) => (
              <div
                key={index}
                className={`${styles.avatar} ${selectedAvatar === index ? styles.selectedAvatar : ''}`}
                onClick={() => handleAvatarClick(index)}
              >
                <img 
                  src={`/assets/${filename}`} 
                  alt={`Avatar ${index + 1}`} 
                  className={styles.avatarImage} 
                />
              </div>
            ))}
          </div>

          {/* Pagination buttons */}
          <div className={styles.pagination}>
            <button type="button" className={styles.prevButton} disabled>{"<"}</button>
            <button type="submit" className={styles.nextButton}>{">"}</button> {/* Change to submit type */}
          </div>
        </form> {/* Close the form element here */}
      </div>
    </div>
  );
};

export default DemographicStep;
