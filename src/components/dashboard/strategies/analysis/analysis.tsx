// src/app/dashboard/strategies/analysis/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '@/app/components/Layout';
import {
  Container,
  TextField,
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
}

function getWeekNumber(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = (date.getTime() - start.getTime() + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000)) / 86400000;
  return 'W' + Math.ceil((diff + ((start.getDay() + 1) % 7)) / 7);
}

function getStartingDay(weekNumber: number, year: number): string {
  const firstDayOfYear = new Date(year, 0, 1);
  const days = (weekNumber - 1) * 7;
  const startDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + days - firstDayOfYear.getDay() + 1));
  return startDate.toISOString().split('T')[0];
}

function roundUpAds(investment: number): number {
  if (investment <= 7) return Math.ceil(investment / 5);
  if (investment <= 20) return Math.ceil(investment / 8);
  return Math.ceil(investment / 10);
}

function calculatePlan(input: PlanInput): WeeklyPlan[] {
  const percentages = [0.10, 0.15, 0.15, 0.20, 0.20, 0.20];
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
    });

    startDate.setDate(startDate.getDate() + 7);
  }

  return levels;
}

const Analysis = () => {
  const [planInput, setPlanInput] = useState<PlanInput>({
    planRequestDate: new Date().toISOString().split('T')[0],
    amountToInvest: 250,
  });

  const planOutput = calculatePlan(planInput);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setPlanInput({
      ...planInput,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  return (
    <Layout>
      <Head>
        <title>Analysis</title>
      </Head>
      <Container>
        <Typography variant="h4" component="h4" gutterBottom>ANALYSIS</Typography>
        <Typography variant="body1" gutterBottom>Performance Analysis</Typography>
        <Box component="form" noValidate autoComplete="off" sx={{ mb: 4 }}>
          <TextField
            fullWidth
            margin="normal"
            variant="outlined"
            label="Plan Request Date"
            type="date"
            name="planRequestDate"
            value={planInput.planRequestDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="normal"
            variant="outlined"
            label="Amount to Invest"
            type="number"
            name="amountToInvest"
            value={planInput.amountToInvest}
            onChange={handleInputChange}
          />
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
              <TableRow>
                <TableCell>CALCULATED INCREASE</TableCell>
                {planOutput.map((level, index) => (
                  <TableCell key={index}>{level.calculatedIncrease.toFixed(2)}%</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default Analysis;
