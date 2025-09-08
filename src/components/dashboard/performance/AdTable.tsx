import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AdDetail from './AdSetDetail';
import { getColor, formatValue } from './utils';
import styles from './styles/AdTable.module.css';
import { useLocale } from '@/contexts/LocaleContext';

interface AdTableProps {
  adData: any[];
  currency: string;
  budget: number;
  loading?: boolean;
}

const AdTable: React.FC<AdTableProps> = ({ adData, currency, budget, loading = false }) => {
  
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
          <Box className={styles.tableHeaderCell}>CTR</Box>
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
              <Box className={styles.tbtemp1}>CTR:</Box>
            </Box>
          <Box className={styles.tbContent}>
            <Box className={styles.tableCell}>
              <Box sx={{ backgroundColor: ad.impressions <= 100 ? "#FFEFEF" : "transparent" ,
               borderRadius:'10px', 
                }}>
              <Typography className={`${styles.metricValue} ${ad.impressions >= 100 ? styles.goodMetric : styles.badMetric}`}
                 sx ={{ fontSize: '1.2rem', fontWeight: '600', 
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem', 
                  },
                  }}
              >
                {formatValue(ad.impressions, currency, 'N/A')} {/* Display Impressions */}
              </Typography>
              </Box>
            </Box>

            <Box className={styles.tableCell}>
              <Box sx={{ backgroundColor: (ad.reach || 0) <= 50 ? "#FFEFEF" : "transparent" ,
               borderRadius:'10px', 
                }}>
              <Typography className={`${styles.metricValue} ${(ad.reach || 0) >= 50 ? styles.goodMetric : styles.badMetric}`}
                 sx ={{ fontSize: '1.2rem', fontWeight: '600', 
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem', 
                  },
                  }}
              >
                {formatValue(ad.reach || 0, currency, 'N/A')} {/* Display Reach */}
              </Typography>
              </Box>
            </Box>

            <Box className={styles.tableCell}> {/* Display CTR */}
              <Box sx={{ backgroundColor: ad.ctr <= 1.97 ? "#FFEFEF" : ad.ctr > 1.6 ? "transparent" : getColor(ad.ctr, 1.6, false),
                 borderRadius:'10px', display:'flex', alignItems:'center',
               }}>
              <Typography className={`${styles.metricValue} ${ad.ctr >= 1.6 ? styles.goodMetric : styles.badMetric}`}
                sx ={{ fontSize: '1.2rem', fontWeight: '600',
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {parseFloat(ad?.ctr || 0).toFixed(2)}%
              </Typography>
              </Box>
            </Box>
              </Box>
            </Box>
            </Box>
          {selectedAdId === ad.ad_id && (
            <Box className={styles.detailRow}>
              <AdDetail adId={ad.ad_id} onClose={handleCloseDetail} currency={currency} />
            </Box>
          )}
        </React.Fragment>
      );
    })}
    </Box>
  );
};

export default AdTable;