'use client'

import React, { useEffect, useState } from 'react';
import withAuth from '../../../components/withAuth';
import styles from './styles/Launching.module.css';
import TableCellBox from './TableCellBox';
import { Typography, Box, Paper, Button } from '@mui/material';
import axios from 'axios';

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
    const details = {
      objective: localStorage.getItem('objective'),
      planRequestDate: localStorage.getItem('planRequestDate'),
      amountToInvest: parseFloat(localStorage.getItem('amountToInvest') || '0'),
      adMessage: localStorage.getItem('adMessage'),
      adLink: localStorage.getItem('adLink'),
    };
    setCampaignDetails(details);
    if (details.planRequestDate && details.amountToInvest) {
      const planInput = {
        planRequestDate: details.planRequestDate,
        amountToInvest: details.amountToInvest,
      };
      const calculatedPlan = calculatePlan(planInput, 'yes'); // assuming 'yes' for answerMessages
      setPlanOutput(calculatedPlan);
    }
  }, []);

  const createCampaign = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const fbPage = localStorage.getItem('fbPage');

    if (!accessToken || !userId || !fbPage) {
      alert('Missing required information to create a campaign.');
      return;
    }

    try {
      const response = await axios.post('/api/create-campaign', {
        planOutput,
        accessToken,
        userId,
        fbPage,
        adMessage: campaignDetails.adMessage,
        adLink: campaignDetails.adLink
      });
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign.');
    }
  };

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
          <Typography variant="h4" component="h4" gutterBottom className={styles.title}>Personalized Campaign Setup</Typography>
        </div>
        <Box className={styles.expressLaunching}>
          <Typography variant="body1">Launching</Typography>
        </Box>
        <Box className={styles.audienceTargeting}>
          <Typography variant="body1">Audience Targeting, Launch & Campaign Setup</Typography>
        </Box>
        <Box className={styles.detailsBox}>
          <Typography variant="body1"><strong>Objective:</strong> {campaignDetails.objective}</Typography>
          <Typography variant="body1"><strong>Start Date:</strong> {campaignDetails.planRequestDate}</Typography>
          <Typography variant="body1"><strong>Ad Link:</strong> {campaignDetails.adLink}</Typography>
          <Typography variant="body1"><strong>Budget:</strong> {campaignDetails.amountToInvest} USD</Typography>
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
        <Box className={styles.createCampaignButtonBox}>
          <Button
            variant="contained"
            color="primary"
            onClick={createCampaign}
            className={styles.createCampaignButton}
          >
            Create Campaign
          </Button>
        </Box>
      </Paper>
    </div>
  );
}

export default withAuth(Launching);
