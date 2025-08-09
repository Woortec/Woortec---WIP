import React, { useState } from 'react';
import { Box, Tooltip, IconButton, Typography, CircularProgress } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AdDetail from './AdSetDetail';
import { getColor, formatValue, getComment, getImpressionsComment, calculateSpentColor, calculateSpentComment, convertThresholds, calculateExpectedSpend } from './utils';
import styles from './styles/AdTable.module.css';
import { useLocale } from '@/contexts/LocaleContext';

interface AdTableProps {
  adData: any[];
  currency: string;
  budget: number;
  loading?: boolean;
}

const AdTable: React.FC<AdTableProps> = ({ adData, currency, budget, loading = false }) => {
  const convertedThresholds = convertThresholds(currency);
  const expectedSpend = calculateExpectedSpend(budget, currency);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const { t } = useLocale();

  const handleAdClick = (adId: string) => {
    setSelectedAdId(selectedAdId === adId ? null : adId);
  };

  const handleCloseDetail = () => {
    setSelectedAdId(null);
  };

  // Only require ad and ad_id
  const validAds = adData?.filter((ad) => ad && ad.ad_id) || [];

  // Show loading state if loading is true or no data yet
  if (loading || !adData || adData.length === 0) {
    return (
      <Box className={styles.adTableContainer} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading ad data...</Typography>
      </Box>
    );
  }

  // Show empty state if no valid ads
  if (validAds.length === 0) {
    return (
      <Box className={styles.adTableContainer} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', flexDirection: 'column', textAlign: 'center' }}>
        <Typography sx={{ mb: 2, fontSize: '1.1rem', fontWeight: '500' }}>
          No ad data to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.adTableContainer}>
      <Box className={styles.tableHeader} sx ={{ fontSize: '1.2rem',}}>
        <Box className={styles.tableHeaderCell1}>{t('DashboardCards.adSetNames') || 'AD SET NAMES'}</Box>
        <Box className={styles.tableHeaderCell2}>
          <Box className={styles.tableHeaderCell}>{t('DashboardCards.impressions')}</Box>
          <Box className={styles.tableHeaderCell}>Reach</Box>
          <Box className={styles.tableHeaderCell}>Frequency</Box>
          <Box className={styles.tableHeaderCell}>Clicks</Box>
          <Box className={styles.tableHeaderCell}>CTR (%)</Box> 
          <Box className={styles.tableHeaderCell}>{t('DashboardCards.spent') || 'SPENT'}</Box>
        </Box>
      </Box>

      {validAds.map((ad, index) => {
        return (
          <React.Fragment key={ad.ad_id}>
            
            <Box className={styles.tableRow} onClick={() => handleAdClick(ad.ad_id)}>
              {/*1st Table for mobile*/}
            <Box className={styles.tableCellMobile}>
              <Typography sx={{paddingRight:'3rem',fontWeight:'600', 
                color:'#CCDDE5', fontSize: '1.2rem', '@media (max-width: 770px)': {
                  fontSize: '1rem', paddingBottom:'0.9rem', paddingRight:'1rem',},
                }}>{(index + 1).toString().padStart(2, '0')}</Typography>
              <Typography sx ={{ fontWeight:'600', fontSize: '1.2rem',
                            '@media (max-width: 770px)': {
                              fontSize: '1rem',
                              paddingBottom:'0.5rem'},
                  textAlign: 'left', }}>{ad.name || 'Unnamed Ad'}</Typography>
            </Box>

            <Box className={styles.tableCell1}>
            <Typography sx={{paddingRight:'3rem',fontWeight:'600', 
              color:'#CCDDE5', fontSize: '1.2rem', '@media (max-width: 770px)': {
                fontSize: '1rem', paddingBottom:'1rem'},
              }}>{(index + 1).toString().padStart(2, '0')}</Typography>
            <Typography sx ={{ fontWeight:'600', fontSize: '1.2rem',
                          '@media (max-width: 770px)': {
                            fontSize: '1rem',
                            paddingBottom:'1rem'},
                textAlign: 'left', }}>{ad.name || 'Unnamed Ad'}</Typography>
            </Box>
          <Box className={styles.tableRow2}>
            <Box className={styles.tbtemp}>
              <Box className={styles.tbtemp1}>{t('DashboardCards.impressions')}:</Box>
              <Box className={styles.tbtemp1}>Reach:</Box>
              <Box className={styles.tbtemp1}>Frequency:</Box>
              <Box className={styles.tbtemp1}>Clicks:</Box>
              <Box className={styles.tbtemp1}>CTR (%):</Box> 
              <Box className={styles.tbtemp1}>{t('DashboardCards.spent') || 'SPENT'}:</Box>
            </Box>
          <Box className={styles.tbContent}>
            {/* Impressions */}
            <Box className={styles.tableCell}>
              <Typography className={styles.metricValue}
                sx ={{ fontSize: '1.2rem', fontWeight: '600',
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {formatValue(ad.impressions, currency, false)}
              </Typography>
            </Box>

            {/* Reach */}
            <Box className={styles.tableCell}>
              <Typography className={styles.metricValue}
                sx ={{ fontSize: '1.2rem', fontWeight: '600',
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {formatValue(ad.reach, currency, false)}
              </Typography>
            </Box>

            {/* Frequency */}
            <Box className={styles.tableCell}>
              <Typography className={styles.metricValue}
                sx ={{ fontSize: '1.2rem', fontWeight: '600',
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {ad.frequency ? ad.frequency.toFixed(2) : '0.00'}
              </Typography>
            </Box>

            {/* Clicks */}
            <Box className={styles.tableCell}>
              <Typography className={styles.metricValue}
                sx ={{ fontSize: '1.2rem', fontWeight: '600',
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {formatValue(ad.clicks, currency, false)}
              </Typography>
            </Box>

            {/* CTR */}
            <Box className={styles.tableCell}>
              <Box sx={{ backgroundColor: ad.ctr <= 1.97 ? "#FFEFEF" : ad.ctr > 1.6 ? "transparent" : getColor(ad.ctr, 1.6, false),
                 borderRadius:'10px', display:'flex', alignItems:'center',
               }}>
              <Typography className={`${styles.metricValue} ${ad.ctr >= 1.6 ? styles.goodMetric : styles.badMetric}`}
                sx ={{ fontSize: '1.2rem', fontWeight: '600',
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {ad.ctr.toFixed(2)}%
              </Typography>
              </Box>
            </Box>

            {/* SPENT */}
            <Box className={`${styles.tableCell} ${styles.tableCellLast}`}>
              
              <Box style={{ backgroundColor: ad.spend < expectedSpend * 1 
              ? "#FFEFEF" 
              : ad.spend > expectedSpend * 1.3 
              ? "transparent" 
              : calculateSpentColor(ad.spend, expectedSpend), paddingRight:'0' ,borderRadius:'10px', }}>
              <Typography className={`${styles.metricValue} ${ad.spend >= expectedSpend ? styles.goodMetric : styles.badMetric}`}
                sx ={{ fontSize: '1.2rem', fontWeight: '600',
                  '@media (max-width: 770px)': {
                  fontSize: '0.8rem',
                  },
                }}>
                {formatValue(ad.spend, currency)}
              </Typography>
              </Box>
            </Box>

              {/* <Tooltip title={calculateSpentComment(ad.spend, expectedSpend)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip> */}
              </Box>
            </Box>
            </Box>
          {selectedAdId === ad.ad_id && (
            <Box className={styles.detailRow}>
              <AdDetail adId={ad.ad_id} onClose={handleCloseDetail} />
            </Box>
          )}
        </React.Fragment>
      );
    })}
    </Box>
  );
};

export default AdTable;