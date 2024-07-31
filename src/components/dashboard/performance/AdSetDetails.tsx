import React from 'react';
import styles from './styles/AdSetDetails.module.css';

interface AdSetDetailsProps {
  adSet: any;
  onClose: () => void;
}

const AdSetDetails: React.FC<AdSetDetailsProps> = ({ adSet, onClose }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.closeButton} onClick={onClose}>
          &times;
        </span>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{adSet.name}</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.details}>
              <p><strong>CPM:</strong> {adSet.cpm} PHP</p>
              <p><strong>CPC:</strong> {adSet.cpc} PHP</p>
              <p><strong>Impressions:</strong> {adSet.impressions}</p>
              <p><strong>Spent:</strong> {adSet.spend} PHP</p>
            </div>
            <div className={styles.iconWrapper}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/df131ba591ec1c17f195db8ff0977e61eae7fd0220ab965168a18a19d165b5bb?apiKey=415fe05812414bd2983a5d3a1f882fdf&&apiKey=415fe05812414bd2983a5d3a1f882fdf"
                alt=""
                className={styles.icon}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSetDetails;
