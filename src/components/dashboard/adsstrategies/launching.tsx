'use client'

import React, { useEffect, useState } from 'react';
import withAuth from '../../withAuth';
import styles from './styles/Results.module.css';
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
  const Launchingpercentages = [0.06, 0.10, 0.10, 0.16, 0.16, 0.21, 0.21];
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

const Launching: React.FC = () => {
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
    const level = Math.ceil((index + 1) / 2);
    switch (level) {
      case 1: return styles.levelHeader1;
      case 2: return styles.levelHeader2;
      case 3: return styles.levelHeader3;
      case 4: return styles.levelHeader4;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
            <Paper className={styles.tableContainer}>
      <div className={styles.header}>
        <Typography variant="h4" component="h4" gutterBottom className={styles.title}>Personalized Strategy</Typography>
      </div>
      <Box className={styles.expressLaunching}>
        <Typography variant="body1">Launching</Typography>
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
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={`${styles.levelHeader} ${getHeaderClass(index)}`}>LEVEL {Math.ceil((index + 1) / 2)}</TableCellBox>
          ))}
          <TableCellBox>Starting Day</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={styles.startingDay}>{level.startingDay}</TableCellBox>
          ))}
          <TableCellBox>Week Plans</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={styles.planWeek}>{level.plansWeek}</TableCellBox>
          ))}
          <TableCellBox>Invest Amount / $</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={styles.invest}>{level.investAmount.toFixed(2)}</TableCellBox>
          ))}
          <TableCellBox>Number of Ads</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={styles.numAds}>{level.numberOfAds}</TableCellBox>
          ))}
          <TableCellBox>To Messages</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={styles.toMessages}>{level.toMessages}</TableCellBox>
          ))}
          <TableCellBox>To Link</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={styles.toLink}>{level.toLink}</TableCellBox>
          ))}
          <TableCellBox>Daily Budget / Ad</TableCellBox>
          {planOutput.map((level, index) => (
            <TableCellBox key={index} className={styles.dailyBudget}>{level.dailyBudgetPerAd.toFixed(2)}</TableCellBox>
          ))}
        </div>
      </Paper>
    </div>
  );
}

export default withAuth(Launching);