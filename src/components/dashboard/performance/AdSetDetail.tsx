import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAdData, createThread, addMessageToThread, createRun, waitForRunCompletion, getAIResponse } from './api';
import styles from './styles/AdSetDetail.module.css';

interface AdDetailProps {
  adId: string;
  onClose: () => void;
}

const AdDetail: React.FC<AdDetailProps> = ({ adId, onClose }) => {
  const [adDetail, setAdDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string>('');

  useEffect(() => {
    const getAdDetail = async () => {
      try {
        const { adData } = await fetchAdData(); // Fetch ad data (cached if already fetched)
        const detail = adData.find((ad: any) => ad.ad_id === adId);
        if (detail) {
          setAdDetail(detail);
          if (!detail.aiGeneratedResponse) { // Avoid regenerating AI response if it already exists
            const threadId = await createThread(); // Create a new thread
            await addMessageToThread(threadId, detail); // Add a message to the thread
            const runId = await createRun(threadId); // Attach the assistant to the thread
            await waitForRunCompletion(threadId, runId); // Wait for run completion
            const aiGeneratedResponse = await getAIResponse(threadId); // Get AI-generated response
            detail.aiGeneratedResponse = aiGeneratedResponse || 'Failed to generate AI response.'; // Store response
            setAiResponse(detail.aiGeneratedResponse);
          } else {
            setAiResponse(detail.aiGeneratedResponse); // Use cached AI response
          }
        } else {
          console.error(`No ad detail found for ID: ${adId}`);
          setAiResponse('No ad detail found.');
        }
      } catch (error) {
        console.error('Error during thread, message addition, or run creation:', error);
        setAiResponse('Failed to generate AI response. Please try again later.');
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };
    getAdDetail();
  }, [adId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!adDetail) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box className={styles.adDetailContainer}>
      <Box className={styles.adDetailHeader}>
        <Typography className={styles.adName}>{adDetail?.name}</Typography>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box className={styles.adDetailContent}>
        {adDetail?.imageUrl && (
          <img src={adDetail.imageUrl} alt={`${adDetail?.name} Creative`} className={styles.adCreative} />
        )}
        {!adDetail?.imageUrl && (
          <Typography className={styles.imageNotFound}>No image available for this ad.</Typography>
        )}
        <Box className={styles.metricsContainer}>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>CPC</Typography>
            <Typography className={styles.metricValue}>{adDetail?.cpc || 'N/A'}</Typography>
          </Box>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>CPM</Typography>
            <Typography className={styles.metricValue}>{adDetail?.cpm || 'N/A'}</Typography>
          </Box>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>Impressions</Typography>
            <Typography className={styles.metricValue}>{adDetail?.impressions || 'N/A'}</Typography>
          </Box>
          <Box className={styles.metricCard}>
            <Typography className={styles.metricLabel}>Spent</Typography>
            <Typography className={styles.metricValue}>{adDetail?.spend || 'N/A'}</Typography>
          </Box>
        </Box>
      </Box>
      <Box className={styles.aiResponseContainer}>
        <Typography className={styles.aiResponseTitle}>Woortec Team Response:</Typography>
        {aiResponse ? (
          <Box className={styles.aiResponseContent}>
            {aiResponse.split('\n').map((line, index) => (
              <Typography key={index} component="div" style={{ marginBottom: '8px' }}>
                {line.match(/^\d+\./) ? (
                  <strong>{line}</strong>  // Numbered lines (metrics)
                ) : line.startsWith('- ') ? (
                  <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                    <li>{line.substring(2)}</li>
                  </ul>
                ) : (
                  line 
                )}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography className={styles.aiResponseContent}>Failed to generate AI response.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdDetail;
