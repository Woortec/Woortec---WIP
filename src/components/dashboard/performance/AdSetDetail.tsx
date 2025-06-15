import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';

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
import { useLocale } from '@/contexts/LocaleContext';

interface AdDetailProps {
  adId: string;
  onClose: () => void;
}

const AGENT_NAME = 'Sheela';
const AGENT_TITLE = 'Senior Ads Strategist, Woortec';
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const AdDetail: React.FC<AdDetailProps> = ({ adId, onClose }) => {
  const supabase = createClient();
  const userId = localStorage.getItem('userid')!;
  const { t } = useLocale();

  const [adDetail, setAdDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiResponse, setAiResponse] = useState<string>(''); // always a string
  const [requestingAdvice, setRequestingAdvice] = useState<boolean>(false);
  const [canRequestAdvice, setCanRequestAdvice] = useState<boolean>(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        // 1) fetch ad metrics
        const { adData } = await fetchAdData();
        const detail = adData.find((ad: any) => ad.ad_id === adId);
        setAdDetail(detail ?? null);

        // 2) load persisted advice
        const { data: row } = await supabase
          .from('ad_advice')
          .select('advice, created_at')
          .eq('user_id', userId)
          .eq('ad_id', adId)
          .single();

        if (row) {
          const age = Date.now() - new Date(row.created_at).getTime();
          if (age < WEEK_IN_MS) {
            setAiResponse(row.advice);
            setCanRequestAdvice(false);
          } else {
            // expired advice: clean up
            await supabase
              .from('ad_advice')
              .delete()
              .eq('user_id', userId)
              .eq('ad_id', adId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [adId, supabase, userId]);

  const handleRequestAdvice = async () => {
    setRequestingAdvice(true);
    try {
      const threadId = await createThread();
      await addMessageToThread(threadId, adDetail);
      const runId = await createRun(threadId);
      await waitForRunCompletion(threadId, runId);
      const advice = (await getAIResponse(threadId)) || '';

      // upsert into Supabase
      const { error } = await supabase
        .from('ad_advice')
        .upsert({
          user_id: userId,
          ad_id: adId,
          advice,
        });

      if (error) throw error;

      setAiResponse(advice);
      setCanRequestAdvice(false);
    } catch (err) {
      console.error(err);
      setAiResponse('Failed to generate AI advice. Please try again later.');
    } finally {
      setRequestingAdvice(false);
    }
  };

  // Calculate CTR (Click-Through Rate)
  const calculateCTR = (clicks: number, impressions: number) => {
    if (!impressions || impressions === 0) return 'N/A';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  // Format numbers, fallback to N/A
  const formatValue = (value: any, currency: string = '', fallback: string = 'N/A') => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
      return fallback;
    }
    return `${parseFloat(value).toFixed(2)} ${currency}`;
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!adDetail) {
    return <Typography>No data available</Typography>;
  }

  // format today's date like "Apr 25, 2025"
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Box className={styles.adSetDetailContainer}>
      {/* Header Section */}
      <Box className={styles.adSetDetailHeader}>
        <Typography variant="h2" sx={{ fontWeight: 600, fontSize: '1.3rem' }}>
          {t('DashboardCards.adSetNames')}
        </Typography>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box className={styles.adSetDetailContent}>
        {/* Creative Image */}
        <Box className={styles.adCreative}>
          {adDetail.imageUrl ? (
            <img
              src={adDetail.imageUrl}
              alt="Ad Creative"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
              onLoad={() => console.log('Ad Creative image loaded:', adDetail.imageUrl)}
            />
          ) : (
            <p>No image available</p>
          )}
        </Box>

        {/* Metrics Cards */}
        <Box className={styles.budgetContainer}>
          <Box className={styles.leftBudgetContainer}>
            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#02B194' }}>
                <img src="/assets/attach_money.svg" alt="Budget Icon" />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem', color: '#526067' }}>{t('DashboardCards.budget')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  ${formatValue(adDetail?.cpc)}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#FFDDA0' }}>
                <img src="/assets/attach_money.svg" alt="Budget Icon" />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>{t('DashboardCards.budget')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  ${formatValue(adDetail?.cpc)}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#D3346E' }}>
                <img src="/assets/attach_money.svg" alt="Budget Icon" />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>{t('DashboardCards.budget')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  ${formatValue(adDetail?.cpc)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className={styles.rightBudgetContainer}>
            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#E97476' }}>
                <img src="/assets/attach_money.svg" alt="Budget Icon" />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>CTR (%)</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {calculateCTR(adDetail?.clicks || 0, adDetail?.impressions || 0)}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#02B194' }}>
                <img src="/assets/attach_money.svg" alt="Budget Icon" />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>{t('DashboardCards.impressions')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {formatValue(Math.floor(adDetail?.impressions))}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#02B194' }}>
                <img className={styles.dollarSign} src="/assets/attach_money.png" alt="Budget Icon" />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>{t('DashboardCards.spent')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  ${formatValue(adDetail?.spend)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Expert Advice Button */}
      {canRequestAdvice && (
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestAdvice}
            disabled={requestingAdvice}
          >
            {requestingAdvice ? t('AdSetDetail.requestingAdvice') : t('AdSetDetail.askForExpert')}
          </Button>
        </Box>
      )}

      {/* AI Response */}
      {aiResponse && (
        <Box mt={2} className={styles.aiResponseContainer}>
          {/* Agent Header */}
          <Box mb={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {AGENT_NAME} • {AGENT_TITLE}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {today}
            </Typography>
          </Box>

          {/* Advice Content */}
          <Box className={styles.aiResponseContent}>
            {aiResponse.split('\n').map((line, index) => (
              <Typography key={index} component="div" sx={{ mb: 1 }}>
                {line.match(/^\d+\./) ? (
                  <strong>{line}</strong>
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

          {/* Sign-off */}
          <Box mt={2}>
            <Typography sx={{ fontStyle: 'italic' }}>
              {t('AdSetDetail.best')},<br />
              {AGENT_NAME}<br />
              {AGENT_TITLE}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdDetail;
