'use client';

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

function roundUpAds(investment: number): number {
  if (investment <= 7) return Math.ceil(investment / 5);
  if (investment <= 20) return Math.ceil(investment / 8);
  return Math.ceil(investment / 10);
}

function calculatePlan(input: PlanInput, answerMessages: string): WeeklyPlan[] {
  const percentages = [0.06, 0.10, 0.10, 0.16, 0.16, 0.21, 0.21];
  const levels: WeeklyPlan[] = [];
  const startDate = new Date(input.planRequestDate);
  startDate.setDate(startDate.getDate() + (7 - startDate.getDay()) % 7);

  for (let i = 0; i < percentages.length; i++) {
    const weekNumber = getWeekNumber(startDate);
    const startingDay = startDate.toISOString().split('T')[0];
    const investPercentage = percentages[i];
    const investAmount = input.amountToInvest * investPercentage;
    const numberOfAds = roundUpAds(investAmount);
    const dailyBudgetPerAd = (investAmount / 7) / numberOfAds;
    const calculatedIncrease = i > 0 ? ((levels[i-1].investAmount - investAmount) / levels[i-1].investAmount) * -100 : 0;

    levels.push({
      weekNumber,
      startingDay,
      plansWeek: `W${i + 1}`,
      investPercentage,
      investAmount,
      numberOfAds,
      dailyBudgetPerAd,
      calculatedIncrease,
      toMessages: answerMessages === 'yes' ? 1 : 0,
      toLink: 1,
    });

    startDate.setDate(startDate.getDate() + 7);
  }

  return levels;
}

const Results: React.FC = () => {
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
      <Typography variant="h4" component="h4" gutterBottom>Campaign Results</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1"><strong>Objective:</strong> {campaignDetails.objective}</Typography>
        <Typography variant="body1"><strong>Start Date:</strong> {campaignDetails.startDate}</Typography>
        <Typography variant="body1"><strong>Ad Link:</strong> {campaignDetails.adLink}</Typography>
        <Typography variant="body1"><strong>Budget:</strong> ${campaignDetails.budget}</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>META ADS</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index}>LEVEL {Math.ceil((index + 1) / 2)}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Years Week</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index}>{level.weekNumber}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Starting Day</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index}>{level.startingDay}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Plans Week</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index}>{level.plansWeek}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>INVEST</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index}>${level.investAmount.toFixed(2)}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Nº Ads</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index}>{level.numberOfAds}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>DAILY BUDGET/AD</TableCell>
              {planOutput.map((level, index) => (
                <TableCell key={index}>${level.dailyBudgetPerAd.toFixed(2)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default withAuth(Results);
