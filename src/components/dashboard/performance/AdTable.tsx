import React, { useState } from 'react';
import { Box, Tooltip, IconButton, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AdSetDetail from './AdSetDetail'; // Import the new component
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
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);

  const handleAdSetClick = (adSetId: string) => {
    setSelectedAdSetId(selectedAdSetId === adSetId ? null : adSetId);
  };

  const handleCloseDetail = () => {
    setSelectedAdSetId(null);
  };

  return (
    <Box className={styles.adTableContainer}>
      <Box className={styles.tableHeader}>
        <Box className={styles.tableHeaderCell}>AD SET NAMES</Box>
        <Box className={styles.tableHeaderCell}>CPC</Box>
        <Box className={styles.tableHeaderCell}>CPM</Box>
        <Box className={styles.tableHeaderCell}>IMPRESSIONS</Box>
        <Box className={styles.tableHeaderCell}>SPENT</Box>
      </Box>
      {adData.map((ad, index) => (
        <React.Fragment key={ad.adset_id}>
          <Box className={styles.tableRow} onClick={() => handleAdSetClick(ad.adset_id)}>
            <Box className={`${styles.tableCell} ${styles.tableCellFirst}`}>
              <Typography className={styles.adSetName}>{`0${index + 1} ${ad.name}`}</Typography>
            </Box>
            <Box className={styles.tableCell} style={{ backgroundColor: getColor(ad.cpc, convertedThresholds.cpc, true) }}>
              <Typography className={`${styles.metricValue} ${ad.cpc <= convertedThresholds.cpc ? styles.goodMetric : styles.badMetric}`}>
                {formatValue(ad.cpc, currency)}
              </Typography>
              <Tooltip title={getComment('CPC', ad.cpc, convertedThresholds.cpc, true)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className={styles.tableCell} style={{ backgroundColor: getColor(ad.cpm, convertedThresholds.cpm, true) }}>
              <Typography className={`${styles.metricValue} ${ad.cpm <= convertedThresholds.cpm ? styles.goodMetric : styles.badMetric}`}>
                {formatValue(ad.cpm, currency)}
              </Typography>
              <Tooltip title={getComment('CPM', ad.cpm, convertedThresholds.cpm, true)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className={styles.tableCell} style={{ backgroundColor: getColor(ad.impressions, ad.spend * convertedThresholds.impressions, false) }}>
              <Typography className={styles.metricValue}>
                {formatValue(ad.impressions, currency, false)}
              </Typography>
              <Tooltip title={getImpressionsComment(ad.impressions, ad.spend * convertedThresholds.impressions)} arrow>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
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
          {selectedAdSetId === ad.adset_id && (
            <Box className={styles.detailRow}>
              <AdSetDetail adSetId={ad.adset_id} onClose={handleCloseDetail} />
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default AdTable;
