import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAdData } from './api';
import styles from './styles/AdSetDetail.module.css';

interface AdSetDetailProps {
  adSetId: string;
  onClose: () => void;
}

const AdSetDetail: React.FC<AdSetDetailProps> = ({ adSetId, onClose }) => {
  const [adSetDetail, setAdSetDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAdSetDetail = async () => {
      const { adData } = await fetchAdData();
      const detail = adData.find((ad: any) => ad.adset_id === adSetId);
      if (detail) {
        console.log(`Ad set detail found:`, detail);
      } else {
        console.error(`No ad set detail found for ID: ${adSetId}`);
      }
      setAdSetDetail(detail);
      setLoading(false);
    };
    getAdSetDetail();
  }, [adSetId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!adSetDetail) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box className={styles.adSetDetailContainer}>
      <Box className={styles.adSetDetailHeader}>
        <Typography className={styles.adSetName}>{adSetDetail?.name}</Typography>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box className={styles.adSetDetailContent}>
        {adSetDetail?.imageUrl && (
          <img src={adSetDetail.imageUrl} alt={`${adSetDetail?.name} Creative`} className={styles.adCreative} />
        )}
        {!adSetDetail?.imageUrl && (
          <Typography className={styles.imageNotFound}>No image available for this ad set.</Typography>
        )}
        <Box className={styles.metricsContainer}>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>CPC</Typography>
            <Typography className={styles.metricValue}>{adSetDetail?.cpc || 'N/A'}</Typography>
          </Box>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>CPM</Typography>
            <Typography className={styles.metricValue}>{adSetDetail?.cpm || 'N/A'}</Typography>
          </Box>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>Impressions</Typography>
            <Typography className={styles.metricValue}>{adSetDetail?.impressions || 'N/A'}</Typography>
          </Box>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>Spent</Typography>
            <Typography className={styles.metricValue}>{adSetDetail?.spend || 'N/A'}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdSetDetail;
