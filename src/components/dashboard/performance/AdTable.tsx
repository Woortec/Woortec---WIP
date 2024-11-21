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
      <Box className={styles.tableHeader}>
        <Box className={styles.tableHeaderCell}>AD NAMES</Box>
        <Box className={styles.tableHeaderCell}>CPC</Box>
        <Box className={styles.tableHeaderCell}>CTR (%)</Box> {/* Changed from CPM to CTR */}
        <Box className={styles.tableHeaderCell}>REACH</Box> {/* Changed from Impressions to Reach */}
        <Box className={styles.tableHeaderCell}>SPENT</Box>
      </Box>

      {adData.map((ad, index) => (
        <React.Fragment key={ad.ad_id}>
          <Box className={styles.tableRow} onClick={() => handleAdClick(ad.ad_id)}>
            <Box className={`${styles.tableCell} ${styles.tableCellFirst}`}>
              <Typography className={styles.adName}>{ad.name}</Typography>
            </Box>
            <Box className={styles.tableCell} style={{ backgroundColor: getColor(ad.cpc, convertedThresholds.cpc, true) }}>
              <Typography className={`${styles.metricValue} ${ad.cpc <= convertedThresholds.cpc ? styles.goodMetric : styles.badMetric}`}>
                {formatValue(ad.cpc, currency)} {/* Display CPC */}
              </Typography>
              <Tooltip title={getComment('CPC', ad.cpc, convertedThresholds.cpc, true)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box className={styles.tableCell} style={{ backgroundColor: getColor(ad.ctr, 1.6, false) }}> {/* Display CTR */}
              <Typography className={`${styles.metricValue} ${ad.ctr >= 1.6 ? styles.goodMetric : styles.badMetric}`}>
                {ad.ctr.toFixed(2)}%
              </Typography>
              <Tooltip title={getComment('CTR', ad.ctr, 1.6, false)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* REACH */}
            <Box className={styles.tableCell} style={{ backgroundColor: getColor(ad.impressions / ad.spend, 700, false) }}>
  <Typography className={styles.metricValue}>
    {formatValue(Math.round(ad.impressions), currency, false)}
  </Typography>
  <Tooltip title={getImpressionsComment(Math.round(ad.impressions), ad.spend * 700)} arrow>
    <IconButton>
      <InfoIcon />
    </IconButton>
  </Tooltip>
</Box>

            {/* SPENT */}
            <Box className={`${styles.tableCell} ${styles.tableCellLast}`} style={{ backgroundColor: calculateSpentColor(ad.spend, expectedSpend) }}>
              <Typography className={`${styles.metricValue} ${ad.spend >= expectedSpend ? styles.goodMetric : styles.badMetric}`}>
                {formatValue(ad.spend, currency)}
              </Typography>
              <Tooltip title={calculateSpentComment(ad.spend, expectedSpend)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
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
