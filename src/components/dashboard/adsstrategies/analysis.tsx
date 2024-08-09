'use client'

import React, { useEffect, useState } from 'react';
import withAuth from '../../withAuth';
import styles from './styles/Analysis.module.css';
import TableCellBox from './TableCellBox';
import '../../../../src/styles.css';
import {
  Typography,
  Box,
  Paper,
  Button,
} from '@mui/material';

interface PlanInput {
  planRequestDate: string;
  amountToInvest: number;
}

interface WeeklyPlan {
  weekNumber: string;
  startingDay: string;
  plansWeek: string;
  investPercentage: number;
  investAmount: number;
  numberOfAds: number;
  dailyBudgetPerAd: number;
  calculatedIncrease: number;
  toMessages: number;
  toLink: number;
}

function getWeekNumber(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = (date.getTime() - start.getTime() + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000)) / 86400000;
  return 'W' + Math.ceil((diff + ((start.getDay() + 1) % 7)) / 7);
}

function calculateNumAds(investAmount: number): number {
  let numAds;
  if (investAmount < 100) {
    numAds = Math.ceil(investAmount / 3);
  } else if (investAmount <= 400) {
    numAds = Math.ceil(investAmount / 6);
  } else {
    numAds = Math.ceil(investAmount / 8);
  }

  return Math.ceil(numAds / 7);
}

function calculatePlan(input: PlanInput, answerMessages: string): WeeklyPlan[] {
  const Launchingpercentages = [0.10, 0.15, 0.15, 0.19, 0.19, 0.22];
  const levels: WeeklyPlan[] = [];
  const startDate = new Date(input.planRequestDate);
  startDate.setDate(startDate.getDate() + (7 - startDate.getDay()) % 7);

  for (let i = 0; i < Launchingpercentages.length; i++) {
    const weekNumber = getWeekNumber(startDate);
    const startingDay = startDate.toISOString().split('T')[0];
    const investPercentage = Launchingpercentages[i];
    let investAmount = Math.round(input.amountToInvest * investPercentage);
    const numberOfAds = calculateNumAds(investAmount);

    const dailyBudgetPerAd = ((investAmount / 7) / numberOfAds) < 1 ? 1 : ((investAmount / 7) / numberOfAds);
    const toLink = answerMessages === 'yes' ? (numberOfAds > 8 ? Math.max(0, numberOfAds - 2) : Math.max(0, numberOfAds - 1)) : numberOfAds;
    const toMessages = numberOfAds - toLink;
    const calculatedIncrease = i > 0 ? ((levels[i - 1].investAmount - investAmount) / levels[i - 1].investAmount) * -100 : 0;

    levels.push({
      weekNumber,
      startingDay,
      plansWeek: `W${i + 1}`,
      investPercentage,
      investAmount,
      numberOfAds,
      dailyBudgetPerAd,
      calculatedIncrease,
      toMessages,
      toLink,
    });

    startDate.setDate(startDate.getDate() + 7);
  }

  return levels;
}

const Analysis: React.FC = () => {
  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [planOutput, setPlanOutput] = useState<WeeklyPlan[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const details = JSON.parse(localStorage.getItem('campaignDetails') || '{}');
    setCampaignDetails(details);
    if (details.startDate && details.budget) {
      const planInput = {
        planRequestDate: details.startDate,
        amountToInvest: parseFloat(details.budget),
      };
      const calculatedPlan = calculatePlan(planInput, details.answerMessages);
      setPlanOutput(calculatedPlan);
    }
  }, []);

  const handleSubscribe = () => {
    setIsSubscribed(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ campaignDetails, planOutput }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const { campaignDetails, planOutput } = JSON.parse(content);
        setCampaignDetails(campaignDetails);
        setPlanOutput(planOutput);
      };
      reader.readAsText(file);
    }
  };

  if (!campaignDetails) {
    return <div>Loading...</div>;
  }

  const getHeaderClass = (index: number) => {
    if (index === planOutput.length - 2) {
      return styles.levelHeader2;
    } else if (index === planOutput.length - 1) {
      return styles.levelHeader3;
    } else {
      const level = Math.ceil((index + 1) / 2);
      switch (level) {
        case 1: return styles.levelHeader1;
        case 2: return styles.levelHeader2;
        case 3: return styles.levelHeader2;
        case 4: return styles.levelHeader3;
        default: return '';
      }
    }
  };

  const getHeaderText = (index: number) => {
    if (index === planOutput.length - 2) {
      return 'LEVEL 2';
    } else if (index === planOutput.length - 1) {
      return 'LEVEL 3';
    } else {
      const level = Math.ceil((index + 1) / 2);
      switch (level) {
        case 1: return 'LEVEL 1';
        case 2: return 'LEVEL 2';
        case 3: return 'LEVEL 2';
        case 4: return 'LEVEL 3';
        default: return '';
      }
    }
  };

  return (
    <div className={styles.container}>
      <Paper className={styles.tableContainer}>
        <div className={styles.header}>
          <Typography variant="h4" component="h4" gutterBottom className={styles.title}>Personalized Ads Strategy</Typography>
        </div>
        <Box className={styles.expressLaunching}>
          <Typography variant="body1">Analysis</Typography>
        </Box>
        <Box className={styles.audienceTargeting}>
          <Typography variant="body1">Performance Analysis</Typography>
        </Box>
        <Box className={styles.detailsBox}>
          <Typography variant="body1"><strong>Objective:</strong> {campaignDetails.objective}</Typography>
          <Typography variant="body1"><strong>Start Date:</strong> {campaignDetails.startDate}</Typography>
          <Typography variant="body1"><strong>Ad Link:</strong> {campaignDetails.adLink}</Typography>
          <Typography variant="body1"><strong>Budget:</strong> {campaignDetails.budget} USD</Typography>
        </Box>
        <div className={styles.table}>
          <TableCellBox className={styles.metaAds}>META ADS</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={`${styles.levelHeader} ${getHeaderClass(index)}`}>{getHeaderText(index)}</TableCellBox>
          ))}
          <TableCellBox className={styles.headerCell}>Starting Day</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={`startingDay-${index}`} className={`${styles.startingDay} ${index >= 4 && !isSubscribed ? styles.blurEffect : ''}`}>
              {level.startingDay}
            </TableCellBox>
          ))}
          <TableCellBox className={styles.headerCell}>Week Plans</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={`planWeek-${index}`} className={`${styles.planWeek} ${index >= 4 && !isSubscribed ? styles.blurEffect : ''}`}>
              {level.plansWeek}
            </TableCellBox>
          ))}
          <TableCellBox className={styles.headerCell}>Invest Amount / $</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={`invest-${index}`} className={`${styles.invest} ${index >= 4 && !isSubscribed ? styles.blurEffect : ''}`}>
              {level.investAmount.toFixed(2)}
            </TableCellBox>
          ))}
          <TableCellBox className={styles.headerCell}>Number of Ads</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={`numAds-${index}`} className={`${styles.numAds} ${index >= 4 && !isSubscribed ? styles.blurEffect : ''}`}>
              {level.numberOfAds}
            </TableCellBox>
          ))}
          <TableCellBox className={styles.headerCell}>To Messages</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={`toMessages-${index}`} className={`${styles.toMessages} ${index >= 4 && !isSubscribed ? styles.blurEffect : ''}`}>
              {level.toMessages}
            </TableCellBox>
          ))}
          <TableCellBox className={styles.headerCell}>To Link</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={`toLink-${index}`} className={`${styles.toLink} ${index >= 4 && !isSubscribed ? styles.blurEffect : ''}`}>
              {level.toLink}
            </TableCellBox>
          ))}
          <TableCellBox className={styles.headerCell}>Daily Budget / Ad</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={`dailyBudget-${index}`} className={`${styles.dailyBudget} ${index >= 4 && !isSubscribed ? styles.blurEffect : ''}`}>
              {level.dailyBudgetPerAd.toFixed(2)}
            </TableCellBox>
          ))}
        </div>
        <div className={styles.actions}>
          <Button onClick={handleExport} className={styles.exportButton}>Export Campaign</Button>
          <input
            accept="application/json"
            type="file"
            onChange={handleImport}
            className={styles.importInput}
          />
        </div>
        {!isSubscribed && (
          <div className={styles.subscribeOverlay}>
            <Button className={styles.subscribeButton} onClick={handleSubscribe}>Subscribe to View All Details</Button>
          </div>
        )}
      </Paper>
    </div>
  );
}

export default Analysis;
