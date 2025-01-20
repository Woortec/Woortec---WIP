import React from 'react';
import styles from './styles/InfoBuyerPersona.module.css';

interface InfoBuyerPersonaProps {
    handleReturnToMainMenu: () => void; // Function to return to main menu
  }

const InfoBuyerPersona: React.FC<InfoBuyerPersonaProps> = ({handleReturnToMainMenu }) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
      <div><button className={styles.returnButton} onClick={handleReturnToMainMenu}>← RETURN TO MAIN MENU</button></div>
        <div className={styles.content}>
          <img src="/1Frame.svg" alt="Buyer Persona Info" className={styles.svgIcon} />
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.content}>
          <h1>What is Buyer Persona?</h1>
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
          <div><button className={styles.createBtn} onClick={handleReturnToMainMenu}>Create Buyer Persona!</button></div>
        </div>
      </div>
    </div>
  );
};

export default InfoBuyerPersona;
