import React, { useState } from 'react';
import styles from './styles/CampaignName.module.css';

interface CampaignNameProps {
  onSetName: (labelOne: string, labelTwo: string) => void;
}

const CampaignName: React.FC<CampaignNameProps> = ({ onSetName }) => {
  const [labelOne, setLabelOne] = useState('');
  const [labelTwo, setLabelTwo] = useState('');

  const handleSubmit = () => {
    console.log('Label One:', labelOne);  // Debugging log
    console.log('Label Two:', labelTwo);  // Debugging log
    onSetName(labelOne, labelTwo);
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Label one"
        value={labelOne}
        onChange={(e) => setLabelOne(e.target.value)}
        className={styles.input}
      />
      <input
        type="text"
        placeholder="Label two"
        value={labelTwo}
        onChange={(e) => setLabelTwo(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleSubmit} className={styles.button}>Send</button>
    </div>
  );
};

export default CampaignName;
