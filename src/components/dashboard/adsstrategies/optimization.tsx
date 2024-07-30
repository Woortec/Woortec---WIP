'use client'

import React, { useEffect, useState } from 'react';
import withAuth from '../../withAuth';
import '../../../../src/styles.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
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
  const percentages = [0.10, 0.15, 0.15, 0.20, 0.20, 0.20, 0.15, 0.15, 0.20, 0.20];
  const levels: WeeklyPlan[] = [];
  const startDate = new Date(input.planRequestDate);
  startDate.setDate(startDate.getDate() + (7 - startDate.getDay()) % 7);

  for (let i = 0; i < percentages.length; i++) {
    const weekNumber = getWeekNumber(startDate);
    const startingDay = startDate.toISOString().split('T')[0];
    const investPercentage = percentages[i];
    let investAmount = Math.round(input.amountToInvest * investPercentage);
    const numberOfAds = calculateNumAds(investAmount);

    // Applying the daily budget formula
    const dailyBudgetPerAd = ((investAmount / 7) / numberOfAds) < 1 ? 1 : ((investAmount / 7) / numberOfAds);

    // Apply the toLink formula
    const toLink = answerMessages === 'yes' ? (numberOfAds > 8 ? Math.max(0, numberOfAds - 2) : Math.max(0, numberOfAds - 1)) : numberOfAds;

    // Apply the toMessages formula
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

const Optimization: React.FC = () => {
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

  return (
    <div className="container">
      <Typography variant="h4" component="h4" gutterBottom>Campaign Optimization</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1"><strong>Objective:</strong> {campaignDetails.objective}</Typography>
        <Typography variant="body1"><strong>Start Date:</strong> {campaignDetails.startDate}</Typography>
        <Typography variant="body1"><strong>Ad Link:</strong> {campaignDetails.adLink}</Typography>
        <Typography variant="body1"><strong>Budget:</strong> {campaignDetails.budget} USD</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2}>META ADS</TableCell>
              <TableCell colSpan={2} align="center">LEVEL 1</TableCell>
              <TableCell colSpan={3} align="center">LEVEL 2</TableCell>
              <TableCell colSpan={1} align="center">LEVEL 3</TableCell>
            </TableRow>
            <TableRow>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center" colSpan={level.weekNumber.startsWith('W') ? 1 : 0}>{level.weekNumber}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Starting Day</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center">{level.startingDay}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Plans Week</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center">{level.plansWeek}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>INVEST / USD</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center">{level.investAmount.toFixed(2)}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Nº Ads</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center">{level.numberOfAds}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>To Messages</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center">{level.toMessages}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>To Link</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center">{level.toLink}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>DAILY BUDGET / AD</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index} align="center">{level.dailyBudgetPerAd.toFixed(2)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default withAuth(Optimization);
