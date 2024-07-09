// pages/dashboard.tsx

'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';
import {
  Container,
  TextField,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import Layout from '@/app/components/Layout';
import { saveAs } from 'file-saver';

interface PlanInput {
  planRequestDate: string;
  amountToInvest: number;
  messagesOk: boolean;
  goal: string;
}

interface WeeklyPlan {
  weekNumber: string;
  startingDay: string;
  percentage: number;
  investment: number;
  numberOfAds: number;
  messages: number;
  links: number;
  dailyBudgetPerAd: number;
}

interface PlanOutput {
  levels: WeeklyPlan[];
  calculatedIncrease: number[];
}

function getWeekNumber(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = (date.getTime() - start.getTime() + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000)) / 86400000;
  return 'W' + Math.ceil((diff + ((start.getDay() + 1) % 7)) / 7);
}

function getStartingDay(weekNumber: number, year: number): Date {
  const firstDayOfYear = new Date(year, 0, 1);
  const days = (weekNumber - 1) * 7;
  return new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + days - firstDayOfYear.getDay() + 1));
}

function roundUpAds(investment: number): number {
  if (investment <= 7) return Math.ceil(investment / 5);
  if (investment <= 20) return Math.ceil(investment / 8);
  return Math.ceil(investment / 10);
}

function calculatePlan(input: PlanInput): PlanOutput {
  const percentages = [0.10, 0.15, 0.15, 0.30, 0.30];
  const levels: WeeklyPlan[] = [];
  const calculatedIncrease: number[] = [];
  const startDate = new Date(input.planRequestDate);
  startDate.setDate(startDate.getDate() + (7 - startDate.getDay()) % 7);

  for (let i = 0; i < 5; i++) {
    const weekNumber = getWeekNumber(startDate);
    const startingDay = startDate.toISOString().split('T')[0];
    const percentage = percentages[i];
    const investment = input.amountToInvest * percentage;
    const numberOfAds = roundUpAds(investment);
    const messages = 0;
    const links = input.messagesOk ? numberOfAds - 1 : numberOfAds;
    const dailyBudgetPerAd = Math.max(1, (investment / 7) / numberOfAds);

    levels.push({
      weekNumber,
      startingDay,
      percentage,
      investment,
      numberOfAds,
      messages,
      links,
      dailyBudgetPerAd,
    });

    if (i > 0) {
      const prevAds = levels[i - 1].numberOfAds;
      calculatedIncrease.push((prevAds - numberOfAds) / prevAds);
    } else {
      calculatedIncrease.push(0);
    }

    startDate.setDate(startDate.getDate() + 7);
  }

  return { levels, calculatedIncrease };
}

const ExpressLaunching = () => {
  const [planInput, setPlanInput] = useState<PlanInput>({
    planRequestDate: new Date().toISOString().split('T')[0],
    amountToInvest: 250,
    messagesOk: false,
    goal: 'LANDING_PAGE_VIEWS',
  });

  const planOutput = calculatePlan(planInput);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPlanInput({
      ...planInput,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const downloadPNG = () => {
    if (tableRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = tableRef.current.clientWidth;
      canvas.height = tableRef.current.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        Array.from(tableRef.current.rows).forEach((row, rowIndex) => {
          Array.from(row.cells).forEach((cell, cellIndex) => {
            ctx.fillText(cell.innerText, cellIndex * 100 + 10, rowIndex * 20 + 20);
          });
        });
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'express-launching.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  const downloadCSV = () => {
    const headers = [
      'META ADS',
      ...planOutput.levels.map((_, index) => `LEVEL ${Math.ceil((index + 1) / 2)}`)
    ];
    
    const rows = [
      ['Years Week', ...planOutput.levels.map(level => level.weekNumber)],
      ['Starting Day', ...planOutput.levels.map(level => level.startingDay)],
      ['Plans Week', ...planOutput.levels.map((_, index) => `W${index + 1}`)],
      ['Invest (%)', ...planOutput.levels.map(level => (level.percentage * 100).toFixed(2) + '%')],
      ['Invest Amount', ...planOutput.levels.map(level => `$${level.investment.toFixed(2)}`)],
      ['Number of Ads', ...planOutput.levels.map(level => level.numberOfAds)],
      ['To Messages', ...planOutput.levels.map(level => level.messages)],
      ['To Link', ...planOutput.levels.map(level => level.links)],
      ['Daily Budget/Ad', ...planOutput.levels.map(level => `$${level.dailyBudgetPerAd.toFixed(2)}`)],
      ['Calculated Increase', ...planOutput.calculatedIncrease.map(inc => `${(inc * 100).toFixed(2)}%`)]
    ];
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'express-launching.csv');
  };

  return (
    <Layout>
      <Head>
        <title>Express Launching</title>
      </Head>
      <Container>
        <Typography variant="h4" gutterBottom>
          Express Launching
        </Typography>
        <TextField
          label="Plan Request Date"
          type="date"
          name="planRequestDate"
          value={planInput.planRequestDate}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Approx. Amount to Invest"
          type="number"
          name="amountToInvest"
          value={planInput.amountToInvest}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="messagesOk"
              checked={planInput.messagesOk}
              onChange={handleInputChange}
            />
          }
          label="Messages OK?"
        />
        <TextField
          label="Goal"
          name="goal"
          value={planInput.goal}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={downloadPNG} sx={{ mr: 2 }}>
            Download as PNG
          </Button>
          <Button variant="contained" color="secondary" onClick={downloadCSV}>
            Download as CSV
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table ref={tableRef}>
            <TableHead>
              <TableRow>
                <TableCell>Year&apos;s Week</TableCell>
                <TableCell>Starting Day</TableCell>
                <TableCell>Plan&apos;s Week</TableCell>
                <TableCell>Invest (%)</TableCell>
                <TableCell>Invest Amount</TableCell>
                <TableCell>Number of Ads</TableCell>
                <TableCell>To Messages</TableCell>
                <TableCell>To Link</TableCell>
                <TableCell>Daily Budget/Ad</TableCell>
                <TableCell>Calculated Increase</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planOutput.levels.map((level, index) => (
                <TableRow key={index}>
                  <TableCell>{level.weekNumber}</TableCell>
                  <TableCell>{level.startingDay}</TableCell>
                  <TableCell>{`W${index + 1}`}</TableCell>
                  <TableCell>{(level.percentage * 100).toFixed(2)}%</TableCell>
                  <TableCell>${level.investment.toFixed(2)}</TableCell>
                  <TableCell>{level.numberOfAds}</TableCell>
                  <TableCell>{level.messages}</TableCell>
                  <TableCell>{level.links}</TableCell>
                  <TableCell>${level.dailyBudgetPerAd.toFixed(2)}</TableCell>
                  <TableCell>{(planOutput.calculatedIncrease[index] * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default ExpressLaunching;
