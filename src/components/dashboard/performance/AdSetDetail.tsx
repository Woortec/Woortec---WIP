import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAdData, createThread, addMessageToThread, createRun, waitForRunCompletion, getAIResponse } from './api';
import styles from './styles/AdSetDetail.module.css';

interface AdSetDetailProps {
  adSetId: string;
  onClose: () => void;
}

const AdSetDetail: React.FC<AdSetDetailProps> = ({ adSetId, onClose }) => {
  const [adSetDetail, setAdSetDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string>('');

  useEffect(() => {
    const getAdSetDetail = async () => {
      try {
        const { adData } = await fetchAdData(); // Fetch ad data (cached if already fetched)
        const detail = adData.find((ad: any) => ad.adset_id === adSetId);
        if (detail) {
          setAdSetDetail(detail);
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
          console.error(`No ad set detail found for ID: ${adSetId}`);
          setAiResponse('No ad set detail found.');
        }
      } catch (error) {
        console.error('Error during thread, message addition, or run creation:', error);
        setAiResponse('Failed to generate AI response. Please try again later.');
      } finally {
        setLoading(false); // Stop the loading indicator
      }
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
            <Typography className={styles.metricValue}>{adSetDetail?.costPerMessagingConversationStarted || 'N/A'}</Typography>
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

export default AdSetDetail;
