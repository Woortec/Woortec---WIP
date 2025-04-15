import React, { useState } from 'react';
import { Box, Tooltip, IconButton, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AdDetail from './AdSetDetail';
import { getColor, formatValue, getComment, getImpressionsComment, calculateSpentColor, calculateSpentComment, convertThresholds, calculateExpectedSpend } from './utils';
import styles from './styles/AdTable.module.css';

interface AdTableProps {
  adData: any[];
  currency: string;
  budget: number;
}

const AdTable: React.FC<AdTableProps> = ({ adData, currency, budget }) => {
  const convertedThresholds = convertThresholds(currency);
  const expectedSpend = calculateExpectedSpend(budget, currency);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const handleAdClick = (adId: string) => {
    setSelectedAdId(selectedAdId === adId ? null : adId);
  };

  const handleCloseDetail = () => {
    setSelectedAdId(null);
  };

  return (
    <Box className={styles.adTableContainer}>
      <Box className={styles.tableHeader} sx ={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem',}}>
        <Box className={styles.tableHeaderCell1}>AD SET NAMES</Box>
        <Box className={styles.tableHeaderCell2}>
          <Box className={styles.tableHeaderCell}>IMPRESSIONS</Box>
          <Box className={styles.tableHeaderCell}>CPC</Box>
          <Box className={styles.tableHeaderCell}>CTR</Box> 
          <Box className={styles.tableHeaderCell}>SPENT</Box>
        </Box>
      </Box>

      {adData.map((ad, index) => (
        <React.Fragment key={ad.ad_id}>
          
          <Box className={styles.tableRow} onClick={() => handleAdClick(ad.ad_id)}>
            {/*1st Table for mobile*/}
          <Box className={styles.tableCellMobile}>
            <Typography sx={{paddingRight:'3rem', fontFamily:'Poppins',fontWeight:'600', 
              color:'#CCDDE5', fontSize: '1.2rem', '@media (max-width: 770px)': {
                fontSize: '1rem', paddingBottom:'0.9rem', paddingRight:'1rem',},
              }}>01</Typography>
            <Typography sx ={{ fontWeight:'600', fontFamily: 'Poppins', fontSize: '1.2rem',
                          '@media (max-width: 770px)': {
                            fontSize: '1rem',
                            paddingBottom:'0.5rem'},
                textAlign: 'left', }}>{ad.name}</Typography>
            </Box>

            <Box className={styles.tableCell1}>
            <Typography sx={{paddingRight:'3rem', fontFamily:'Poppins',fontWeight:'600', 
              color:'#CCDDE5', fontSize: '1.2rem', '@media (max-width: 770px)': {
                fontSize: '1rem', paddingBottom:'1rem'},
              }}>01</Typography>
            <Typography sx ={{ fontWeight:'600', fontFamily: 'Poppins', fontSize: '1.2rem',
                          '@media (max-width: 770px)': {
                            fontSize: '1rem',
                            paddingBottom:'1rem'},
                textAlign: 'left', }}>{ad.name}</Typography>
            </Box>
          <Box className={styles.tableRow2}>
            <Box className={styles.tbtemp}>
              <Box className={styles.tbtemp1}>IMPRESSIONS:</Box>
              <Box className={styles.tbtemp1}>CPC:</Box>
              <Box className={styles.tbtemp1}>CTR:</Box> 
              <Box className={styles.tbtemp1}>SPENT:</Box>
            </Box>
          <Box className={styles.tbContent}>
            <Box className={styles.tableCell}>
              <Box sx={{ backgroundColor: ad.cpc >= convertedThresholds.cpc ? "#FFEFEF" : "transparent" ,
               borderRadius:'10px', 
                }}>
              <Typography className={`${styles.metricValue} ${ad.cpc <= convertedThresholds.cpc ? styles.goodMetric : styles.badMetric}`}
                 sx ={{ fontSize: '1.2rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", 
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem', 
                  },
                  }}
              >
                {formatValue(ad.cpc, currency)} {/* Display CPC */}
              </Typography>

              {/* <Tooltip title={getComment('CPC', ad.cpc, convertedThresholds.cpc, true)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip> */}
              </Box>
            </Box>

            <Box className={styles.tableCell}> {/* Display CTR */}
              <Box sx={{ backgroundColor: ad.ctr <= 1.97 ? "#FFEFEF" : ad.ctr > 1.6 ? "transparent" : getColor(ad.ctr, 1.6, false),
                 borderRadius:'10px', display:'flex', alignItems:'center',
               }}>
              <Typography className={`${styles.metricValue} ${ad.ctr >= 1.6 ? styles.goodMetric : styles.badMetric}`}
                sx ={{ fontSize: '1.2rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {ad.ctr.toFixed(2)}%
              </Typography>
              </Box>

              {/* <Tooltip title={getComment('CTR', ad.ctr, 1.6, false)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip> */}

            </Box>

            {/* REACH */}
            <Box className={styles.tableCell} sx={{ backgroundColor: ad.impressions / ad.spend <= 350 ? "transparent" : getColor(ad.impressions / ad.spend, 70000, false),
            }}>
              <Typography className={styles.metricValue}
                sx ={{ fontSize: '1.2rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
                  '@media (max-width: 770px)': {
                    fontSize: '0.8rem',
                  },
                }}>
                {formatValue(ad.impressions, currency, false)}
              </Typography>

              {/* <Tooltip title={getImpressionsComment(ad.impressions, ad.spend * 700)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip> */}

            </Box>

            {/* SPENT */}
            <Box className={`${styles.tableCell} ${styles.tableCellLast}`}>
              
              <Box style={{ backgroundColor: ad.spend < expectedSpend * 1 
              ? "#FFEFEF" 
              : ad.spend > expectedSpend * 1.3 
              ? "transparent" 
              : calculateSpentColor(ad.spend, expectedSpend), paddingRight:'0' ,borderRadius:'10px', }}>
              <Typography className={`${styles.metricValue} ${ad.spend >= expectedSpend ? styles.goodMetric : styles.badMetric}`}
                sx ={{ fontSize: '1.2rem', fontFamily: "'Poppins', sans-serif", fontWeight: '600',
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
      ))}
    </Box>
  );
};

export default AdTable;