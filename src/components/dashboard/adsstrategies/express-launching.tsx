'use client'

import React, { useEffect, useState } from 'react';
import withAuth from '../../withAuth';
import styles from './styles/ExpressLaunching.module.css';
import TableCellBox from './TableCellBox';
import '../../../../src/styles.css';
import {
  Typography,
  Box,
  Paper,
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
  const Launchingpercentages = [0.10, 0.15, 0.15, 0.30, 0.30];
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

const ExpressLaunching: React.FC = () => {
  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [planOutput, setPlanOutput] = useState<WeeklyPlan[]>([]);

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

  if (!campaignDetails) {
    return <div>Loading...</div>;
  }

  const getHeaderClass = (index: number) => {
    switch (index) {
      case 0: return styles.levelHeader1; // LEVEL 1
      case 1:
      case 2: return styles.levelHeader2; // LEVEL 2
      case 3:
      case 4: return styles.levelHeader3; // LEVEL 3
      default: return '';
    }
  };

  const getHeaderText = (index: number) => {
    switch (index) {
      case 0: return 'LEVEL 1'; // LEVEL 1
      case 1:
      case 2: return 'LEVEL 2'; // LEVEL 2
      case 3:
      case 4: return 'LEVEL 3'; // LEVEL 3
      default: return '';
    }
  };

  const headerKeys: (keyof WeeklyPlan)[] = [
    'startingDay',
    'plansWeek',
    'investAmount',
    'numberOfAds',
    'toMessages',
    'toLink',
    'dailyBudgetPerAd',
  ];

  const headerLabels = [
    'Starting Day',
    'Week Plans',
    'Invest Amount / $',
    'Number of Ads',
    'To Messages',
    'To Link',
    'Daily Budget / Ad',
  ];

  return (
    <div className={styles.container}>
      <Paper className={styles.tableContainer}>
        <div className={styles.header}>
          <Typography variant="h4" component="h4" gutterBottom className={styles.title}>Personalized Ads Strategy</Typography>
        </div>
        <Box className={styles.expressLaunching}>
          <Typography variant="body1">Express Launching</Typography>
        </Box>
        <Box className={styles.audienceTargeting}>
          <Typography variant="body1">Audience Targeting, Launch & Campaign Setup</Typography>
        </Box>
        <Box className={styles.detailsBox}>
          <Typography variant="body1"><strong>Objective:</strong> {campaignDetails.objective}</Typography>
          <Typography variant="body1"><strong>Start Date:</strong> {campaignDetails.startDate}</Typography>
          <Typography variant="body1"><strong>Ad Link:</strong> {campaignDetails.adLink}</Typography>
          <Typography variant="body1"><strong>Budget:</strong> {campaignDetails.budget} USD</Typography>
        </Box>
        <div className={styles.table}>
          <TableCellBox className={styles.metaAds}>META ADS</TableCellBox>
          {[0, 1, 2, 3, 4].map((index) => (
            <TableCellBox key={index} className={`${styles.levelHeader} ${getHeaderClass(index)}`}>{getHeaderText(index)}</TableCellBox>
          ))}
          {headerKeys.map((key, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <TableCellBox className={styles.headerCell}>{headerLabels[rowIndex]}</TableCellBox>
              {planOutput.slice(0, 5).map((level, index) => (
                <TableCellBox key={`${key}-${index}`} className={styles[key]}>
                  {typeof level[key] === 'number' ? level[key].toFixed(2) : level[key]}
                </TableCellBox>
              ))}
            </React.Fragment>
          ))}
        </div>
      </Paper>
    </div>
  );
}

export default ExpressLaunching;
  