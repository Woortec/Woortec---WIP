import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import MouseIcon from '@mui/icons-material/Mouse';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
import { formatValue as formatCurrency } from './utils';
import styles from './styles/AdSetDetail.module.css';
import { useLocale } from '@/contexts/LocaleContext';

interface AdDetailProps {
  adId: string;
  onClose: () => void;
  currency: string;
}

const AGENT_NAME = 'Sheela';
const AGENT_TITLE = 'Senior Ads Strategist, Woortec';
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const AdDetail: React.FC<AdDetailProps> = ({ adId, onClose, currency }) => {
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
          setAiResponse(row.advice);
          setCanRequestAdvice(false); // Hide button if advice exists
        } else {
          setAiResponse('');
          setCanRequestAdvice(true);
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
      setCanRequestAdvice(false); // Hide button after response
    } catch (err) {
      console.error(err);
      setAiResponse(t('AdSetDetail.failedToGenerate'));
    } finally {
      setRequestingAdvice(false);
    }
  };

  // Calculate CTR (Click-Through Rate)
  const calculateCTR = (clicks: number, impressions: number) => {


    if (!impressions || impressions === 0) return '0.00%';
    return `${((clicks / impressions) * 100).toFixed(2)}%`;
  };

  // Format numbers, fallback to N/A
  const formatValue = (value: any, currency: string = '', fallback: string = 'N/A') => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
      return fallback;
    }
    return `${parseFloat(value).toFixed(2)} ${currency}`;
  };

  // Format integer-like metrics (e.g., impressions, reach, clicks) without decimals
  const formatInteger = (value: any, fallback: string = 'N/A') => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
      return fallback;
    }
    return Math.round(parseFloat(value)).toLocaleString();
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!adDetail) {
    return <Typography>{t('AdSetDetail.noDataAvailable')}</Typography>;
  }

  // format today's date like "Apr 25, 2025"
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  console.log("adasdasdasdad",adDetail);

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
            <p>{t('AdSetDetail.noImageAvailable')}</p>
          )}
        </Box>

        {/* Metrics Cards */}
        <Box className={styles.budgetContainer}>
          <Box className={styles.leftBudgetContainer}>
            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#02B194' }}>
                <VisibilityIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem', color: '#526067' }}>{t('DashboardCards.impressions')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {formatInteger(adDetail?.impressions)}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#FFDDA0' }}>
                <PeopleIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>Reach</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {formatInteger(adDetail?.reach || 0)}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#D3346E' }}>
                <RepeatIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>Frequency</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {formatValue(adDetail?.frequency || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className={styles.rightBudgetContainer}>
            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#E97476' }}>
                <MouseIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>Clicks</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {formatInteger(adDetail?.clicks || 0)}
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#02B194' }}>
                <TrendingUpIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>{t('AdSetDetail.ctrPercent')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {parseFloat(adDetail?.ctr || 0).toFixed(2)}%
                </Typography>
              </Box>
            </Box>

            <Box className={styles.budgetCard}>
              <Box className={styles.iconWrapper} sx={{ backgroundColor: '#02B194' }}>
                <AttachMoneyIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Box className={styles.budgetInfo}>
                <Typography sx={{ fontSize: '0.8rem' }}>{t('DashboardCards.spent')}</Typography>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: '800' }}>
                  {formatCurrency(adDetail?.spend, currency)}
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
