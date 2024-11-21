import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';

import { createClient } from '../../../../utils/supabase/client';
import {
  addMessageToThread,
  createRun,
  createThread,
  fetchAdData,
  getAIResponse,
  waitForRunCompletion,
} from './api';
import styles from './styles/AdSetDetail.module.css';

interface AdDetailProps {
  adId: string;
  onClose: () => void;
}

const AdDetail: React.FC<AdDetailProps> = ({ adId, onClose }) => {
  const [adDetail, setAdDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [requestingAdvice, setRequestingAdvice] = useState<boolean>(false);
  const [canRequestAdvice, setCanRequestAdvice] = useState<boolean>(true);
  const [currency, setCurrency] = useState<string>('USD'); // Default to USD

  const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
  const ADVICE_REQUEST_KEY = `lastAdviceRequest_${adId}`;

  useEffect(() => {
    const checkAdviceEligibility = () => {
      const lastRequest = localStorage.getItem(ADVICE_REQUEST_KEY);
      if (lastRequest) {
        const lastRequestDate = new Date(parseInt(lastRequest, 10));
        const currentDate = new Date();
        if (currentDate.getTime() - lastRequestDate.getTime() < WEEK_IN_MS) {
          setCanRequestAdvice(false);
        }
      }
    };

    const getAdDetail = async () => {
      try {
        const { adData, currency } = await fetchAdData(); // Fetch ad data and currency
        const detail = adData.find((ad: any) => ad.ad_id === adId);
        if (detail) {
          setAdDetail(detail);
          setCurrency(currency); // Set the currency in state
          if (detail.aiGeneratedResponse) {
            setAiResponse(detail.aiGeneratedResponse); // Use cached AI response
          }
        } else {
          console.error(`No ad detail found for ID: ${adId}`);
          setAiResponse('No ad detail found.');
        }
      } catch (error) {
        console.error('Error fetching ad detail:', error);
        setAiResponse('Failed to retrieve ad details. Please try again later.');
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    checkAdviceEligibility();
    getAdDetail();
  }, [adId]);

  const handleRequestAdvice = async () => {
    const userId = localStorage.getItem('userid');
    const supabase = createClient();
    const { data, error } = await supabase.from('user').select('*').eq('uuid', userId);

    if (data && data[0]?.isQuery) {
      setCanRequestAdvice(false);
      alert("You can use this feature once per week, and you've already used it this week.");
      return;
    }
    if (!canRequestAdvice) return;

    setRequestingAdvice(true);
    try {
      const threadId = await createThread(); // Create a new thread
      await addMessageToThread(threadId, adDetail); // Add a message to the thread
      const runId = await createRun(threadId); // Attach the assistant to the thread
      await waitForRunCompletion(threadId, runId); // Wait for run completion
      const aiGeneratedResponse = await getAIResponse(threadId); // Get AI-generated response

      adDetail.aiGeneratedResponse = aiGeneratedResponse; // Store AI response
      setAdDetail({ ...adDetail });
      await supabase.from('user').update({ isQuery: true }).eq('uuid', userId);

      // Store the time of the request
      localStorage.setItem(ADVICE_REQUEST_KEY, Date.now().toString());
      setCanRequestAdvice(false);
    } catch (error) {
      console.error('Error during advice request:', error);
      setAiResponse('Failed to generate AI response. Please try again later.');
    } finally {
      setRequestingAdvice(false);
    }
  };

  // Calculate CTR (Click-Through Rate)
  const calculateCTR = (clicks: number, impressions: number) => {
    if (!impressions || impressions === 0) return 'N/A'; // Avoid division by zero
    const ctr = (clicks / impressions) * 100;
    return ctr.toFixed(2); // Return CTR as a percentage (2 decimal places)
  };

  // Ensure values are valid numbers, fallback to 'N/A' if not
  const formatValue = (
    value: any,
    currency: string = '',
    fallback: string = 'N/A',
    decimals: number = 2 // Default to 2 decimal places
  ) => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
      return fallback; // If value is invalid, return fallback
    }

    return `${parseFloat(value)
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currency}`.trim(); // Format the value and append currency
  };

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
        <img
          src={adDetail.imageUrl || '/path-to-placeholder-image.png'}
          alt="Ad Creative"
          className={styles.adCreative}
        />

        <Box className={styles.budgetContainer}>
          {/* CPC */}
          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} green`}>CPC</div>
            <div className={styles.budgetValue}>
              {formatValue(adDetail?.cpc, currency)} {/* Pass currency if desired */}
            </div>
          </Box>

          {/* CTR */}
          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} yellow`}>CTR (%)</div>
            <div className={styles.budgetValue}>
              {calculateCTR(adDetail?.clicks || 0, adDetail?.impressions || 0)}
            </div>
          </Box>

          {/* Impressions */}
          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} yellow`}>IMPRESSIONS</div>
            <div className={styles.budgetValue}>
              {formatValue(adDetail?.impressions, '', 'N/A', 0)} {/* No decimal places */}
            </div>
          </Box>

          {/* Spend */}
          <Box className={styles.budgetCard}>
            <div className={`${styles.budgetIcon} yellow`}>SPEND</div>
            <div className={styles.budgetValue}>
              {formatValue(adDetail?.spend, currency)} {/* Include currency */}
            </div>
          </Box>
          {/* Add more budget cards as needed */}
        </Box>
      </Box>

      {/* AI Response Section */}
      <Box className={styles.aiResponseContainer}>
        <Typography className={styles.aiResponseTitle}>Woortec Team Response:</Typography>
        {adDetail.aiGeneratedResponse ? (
          <Box className={styles.aiResponseContent}>
            {adDetail.aiGeneratedResponse.split('\n').map((line: string, index: number) => (
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
          <Typography className={styles.aiResponseContent}>{aiResponse || '.'}</Typography>
        )}
      </Box>

      {/* Button to request expert's advice */}
      {canRequestAdvice ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleRequestAdvice}
          disabled={requestingAdvice}
          style={{ marginTop: '16px' }}
        >
          {requestingAdvice ? 'Requesting Advice...' : "Ask for Expert's Advice"}
        </Button>
      ) : (
        <Typography variant="body2" color="error" style={{ marginTop: '16px' }}>
          You can only request advice once per week.
        </Typography>
      )}
    </Box>
  );
};

export default AdDetail;
