  import React, { useState } from 'react';
  import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, IconButton, Collapse, Box, Typography } from '@mui/material';
  import InfoIcon from '@mui/icons-material/Info';
  import { getColor, formatValue, getComment, getImpressionsComment, calculateSpentColor, calculateSpentComment, convertThresholds, calculateExpectedSpend } from './helperFunctions';
  import styles from './styles/AdSetDetails.module.css';

  interface AdSet {
    id: string;
    name: string;
  }

  interface Insight {
    adset_id: string;
    cpm: number;
    cpc: number;
    impressions: number;
    spend: number;
    name: string;
  }

  interface AdTableProps {
    adData: (Insight & { name: string })[];
    currency: string;
    budget: number;
  }

  const AdTable: React.FC<AdTableProps> = ({ adData, currency, budget }) => {
    const [expandedAdSetId, setExpandedAdSetId] = useState<string | null>(null);

    const handleAdSetClick = (adSetId: string) => {
      setExpandedAdSetId(expandedAdSetId === adSetId ? null : adSetId);
    };

    const convertedThresholds = convertThresholds(currency);
    const expectedSpend = calculateExpectedSpend(budget, currency);

    return (
      <TableContainer component={Paper} className={styles.table} style={{ marginBottom: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={styles.headerCell}><strong>AD SET NAMES</strong></TableCell>
              <TableCell align="center" className={styles.headerCell}><strong>CPC</strong></TableCell>
              <TableCell align="center" className={styles.headerCell}><strong>CPM</strong></TableCell>
              <TableCell align="center" className={styles.headerCell}><strong>IMPRESSIONS</strong></TableCell>
              <TableCell align="center" className={`${styles.headerCell} ${styles.lastCell}`}><strong>SPENT</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adData.map(ad => (
              <React.Fragment key={ad.adset_id}>
                <TableRow onClick={() => handleAdSetClick(ad.adset_id)} style={{ cursor: 'pointer' }}>
                  <TableCell className={styles.dataCell}>{ad.name}</TableCell>
                  <TableCell align="center" className={styles.dataCell} style={{ backgroundColor: getColor(ad.cpc, convertedThresholds.cpc, true) }}>
                    {formatValue(ad.cpc, currency)}
                    <Tooltip title={getComment('CPC', ad.cpc, convertedThresholds.cpc, true)} arrow>
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" className={styles.dataCell} style={{ backgroundColor: getColor(ad.cpm, convertedThresholds.cpm, true) }}>
                    {formatValue(ad.cpm, currency)}
                    <Tooltip title={getComment('CPM', ad.cpm, convertedThresholds.cpm, true)} arrow>
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" className={styles.dataCell} style={{ backgroundColor: getColor(ad.impressions, ad.spend * convertedThresholds.impressions, false) }}>
                    {formatValue(ad.impressions, currency, false)}
                    <Tooltip title={getImpressionsComment(ad.impressions, ad.spend * convertedThresholds.impressions)} arrow>
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" className={`${styles.dataCell} ${styles.lastCell}`} style={{ backgroundColor: calculateSpentColor(ad.spend, expectedSpend) }}>
                    {formatValue(ad.spend, currency)}
                    <Tooltip title={calculateSpentComment(ad.spend, expectedSpend)} arrow>
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expandedAdSetId === ad.adset_id} timeout="auto" unmountOnExit>
                      <Box margin={2}>
                        <Typography variant="h6" gutterBottom component="div">
                          Details for {ad.name}
                        </Typography>
                        <Typography variant="body1">
                          <strong>CPM:</strong> {ad.cpm} {currency}
                        </Typography>
                        <Typography variant="body1">
                          <strong>CPC:</strong> {ad.cpc} {currency}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Impressions:</strong> {ad.impressions}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Spent:</strong> {ad.spend} {currency}
                        </Typography>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  export default AdTable;
