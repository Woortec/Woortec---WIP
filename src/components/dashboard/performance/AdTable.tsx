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
      <Box className={styles.tableHeader}
      sx ={{ fontSize: { xs: "0.75rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "30px" }, fontFamily: "'Poppins', sans-serif", 
      }}>
        <Box className={styles.tableHeaderCell}>AD SET NAMES</Box>
        <Box className={styles.tableHeaderCell}>IMPRESSIONS</Box>
        <Box className={styles.tableHeaderCell}>CPC</Box>
        <Box className={styles.tableHeaderCell}>CTR</Box> 
        <Box className={styles.tableHeaderCell}>SPENT</Box>
      </Box>

      {adData.map((ad, index) => (
        <React.Fragment key={ad.ad_id}>
          <Box className={styles.tableRow} onClick={() => handleAdClick(ad.ad_id)}>
            <Box className={styles.tableCell}>
            <Typography sx={{paddingRight:'50px', fontSize:{xl:'30px'}, fontFamily:'Poppins',
              fontWeight:'600', color:'#CCDDE5'}}>01</Typography>
            <Typography
             sx ={{ fontSize: { xs: "0.75rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "2rem" }, fontWeight: '600',
             fontFamily: "'Poppins', sans-serif",
             }}
            >{ad.name}</Typography>
            </Box>

            <Box className={styles.tableCell}>
              <Box style={{ backgroundColor: ad.cpc >= convertedThresholds.cpc ? "#FFEFEF" : "transparent" ,
                padding:'10px', borderRadius:'10px',
                }}>
              <Typography className={`${styles.metricValue} ${ad.cpc <= convertedThresholds.cpc ? styles.goodMetric : styles.badMetric}`}
                 sx ={{ fontSize: { xs: "0.75rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "2rem" }, fontWeight: '600',
                 fontFamily: "'Poppins', sans-serif", 
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

            <Box className={styles.tableCell} > {/* Display CTR */}
              <Box style={{ backgroundColor: ad.ctr <= 0.97 ? "#FFEFEF" : ad.ctr > 1.6 ? "transparent" : getColor(ad.ctr, 1.6, false),
                padding:'10px', borderRadius:'10px',
               }}>
              <Typography className={`${styles.metricValue} ${ad.ctr >= 1.6 ? styles.goodMetric : styles.badMetric}`}
                sx ={{ fontSize: { xs: "0.75rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "2rem" }, fontWeight: '600',
                fontFamily: "'Poppins', sans-serif",
                }}
                >
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
            <Box className={styles.tableCell} style={{ backgroundColor: ad.impressions / ad.spend <= 350 ? "transparent" : getColor(ad.impressions / ad.spend, 70000, false) }}>
              <Typography className={styles.metricValue}
                sx ={{ fontSize: { xs: "0.75rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "2rem" }, fontWeight: '600',
                fontFamily: "'Poppins', sans-serif",
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
              : calculateSpentColor(ad.spend, expectedSpend), padding:'10px', borderRadius:'10px', }}>
              <Typography className={`${styles.metricValue} ${ad.spend >= expectedSpend ? styles.goodMetric : styles.badMetric}`}
                sx ={{ fontSize: { xs: "0.75rem", sm: "1rem", md: "1.125rem", lg: "1.25rem", xl: "2rem" }, fontWeight: '600',
                fontFamily: "'Poppins', sans-serif",
                }}
                >
                {formatValue(ad.spend, currency)}
              </Typography>
              </Box>
              {/* <Tooltip title={calculateSpentComment(ad.spend, expectedSpend)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip> */}

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
