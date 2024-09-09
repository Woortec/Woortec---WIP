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
    <Box className={styles.adSetDetailContainer}>
      {/* Header Section */}
      <Box className={styles.adSetDetailHeader}>
        <Typography className={styles.adSetName}>{adDetail?.name}</Typography>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Content Section: Image and Metrics */}
      <Box className={styles.adSetDetailContent}>
        <img src={adDetail.imageUrl || '/path-to-placeholder-image.png'} alt="Ad Creative" className={styles.adCreative} />
        
        <Box className={styles.budgetContainer}>
          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} green`}>CPC</div>
            <div className={styles.budgetValue}> {adDetail?.cpc || 'N/A'}</div>
          </Box>

          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} yellow`}>CPM</div>
            <div className={styles.budgetValue}> {adDetail?.cpm || 'N/A'}</div>
          </Box>
          
          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} yellow`}>IMPRESSIONS</div>
            <div className={styles.budgetValue}> {adDetail?.impressions  || 'N/A'}</div>
          </Box>

          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} yellow`}>SPEND</div>
            <div className={styles.budgetValue}> {adDetail?.spend || 'N/A'}</div>
          </Box>
          {/* Add more budget cards as needed */}
        </Box>
      </Box>

      {/* AI Response Section */}
      <Box className={styles.aiResponseContainer}>
        <Typography className={styles.aiResponseTitle}>Woortec Team Response:</Typography>
        {aiResponse ? (
          <Box className={styles.aiResponseContent}>
            {aiResponse.split('\n').map((line, index) => (
              <Typography key={index} component="div" style={{ marginBottom: '8px' }}>
                {line.match(/^\d+\./) ? (
                  <strong>{line}</strong> // Numbered lines (metrics)
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
