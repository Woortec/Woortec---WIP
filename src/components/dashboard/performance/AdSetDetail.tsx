import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAdSetDetail } from './api'; // Import your API call for fetching ad set details
import styles from './styles/AdSetDetail.module.css'; // Ensure the correct path to your CSS file

interface AdSetDetailProps {
  adSetId: string;
  onClose: () => void;
}

const AdSetDetail: React.FC<AdSetDetailProps> = ({ adSetId, onClose }) => {
  const [adSetDetail, setAdSetDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAdSetDetail = async () => {
      const detail = await fetchAdSetDetail(adSetId); // Fetch ad set details from API
      setAdSetDetail(detail);
      setLoading(false);
    };
    getAdSetDetail();
  }, [adSetId]);

  if (loading) {
    return <CircularProgress />;
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
        <Box className={styles.imagePlaceholder} />
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
      <Typography className={styles.adSetDescription}>
        Introducing woortec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With woortec, you can effortlessly create and manage ads across multiple social media platforms, all in one place. Say goodbye to the hassle of switching between different platforms and hello to a streamlined and efficient ad management experience.
      </Typography>
    </Box>
  );
};

export default AdSetDetail;
