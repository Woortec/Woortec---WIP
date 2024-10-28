import React from 'react';
import styles from './styles/AvatarStep.module.css';

interface AvatarStepProps {
  step: number;
  handleNext: () => void;
}

const AvatarStep: React.FC<AvatarStepProps> = ({ step, handleNext }) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.content}>
          <img src="/1Frame.svg" alt="Buyer Persona Info" className={styles.svgIcon} />
          <h1>What is a buyer persona?</h1>
          <p>Learn everything about buyer personas: how to research, conduct surveys, and design interviews to create your own.</p>
          <button className={styles.infoBtn}>More information</button>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.content}>
          <img src="right-section.svg" alt="Buyer Persona Generator" className={styles.svgIcon} />
          <h1>Buyer persona generator</h1>
          <p>Design a buyer persona that your entire company can use to market, sell, and provide the best services.</p>
          <button className={styles.createBtn} onClick={handleNext}>Create my buyer persona</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarStep;
