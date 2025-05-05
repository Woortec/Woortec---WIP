// src/app/admin/page.tsx
'use client';
import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  Button, Container, CircularProgress
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon   from '@mui/icons-material/AttachMoney';
import PeopleIcon        from '@mui/icons-material/People';
import BoltIcon          from '@mui/icons-material/Bolt';
import { EarningsOverviewChart } from './components/EarningsOverviewChart';
import { RevenueSourcesChart }   from './components/RevenueSourcesChart';

interface BreakdownItem {
  planName: string;
  count:    number;
  total:    number;
}
interface Stats {
  totalUsers:       number;
  activeUsers:      number;
  monthlyEarnings:  number;
  annualEarnings:   number;
  mrrByMonth:       { month: string; revenue: number }[];
  monthlyBreakdown: BreakdownItem[];
  annualBreakdown:  BreakdownItem[];
}

export default function AdminPage() {
  const [stats, setStats]               = useState<Stats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: Stats) => {
        setStats(data);
        setLastUpdated(new Date().toLocaleString());
      })
      .catch((err) => {
        console.error('Failed to load stats', err);
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 10 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error || !stats) {
    return (
      <Container sx={{ textAlign: 'center', py: 10 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  const kpis = [
    {
      title: 'Earnings (Monthly)',
      value: `$${stats.monthlyEarnings.toLocaleString()}`,
      icon:  <CalendarMonthIcon fontSize="large" color="primary" />,
    },
    {
      title: 'Earnings (Annual)',
      value: `$${stats.annualEarnings.toLocaleString()}`,
      icon:  <AttachMoneyIcon fontSize="large" sx={{ color: '#10B981' }} />,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon:  <PeopleIcon fontSize="large" sx={{ color: '#3B82F6' }} />,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon:  <BoltIcon fontSize="large" sx={{ color: '#F59E0B' }} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained">Generate Report</Button>
      </Grid>

      {/* Updated timestamp */}
      {lastUpdated && (
        <Typography variant="caption" color="textSecondary" gutterBottom>
          Updated: {lastUpdated}
        </Typography>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2} mb={4}>
        {kpis.map(({ title, value, icon }, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Box mr={2}>{icon}</Box>
                <Box>
                  <Typography color="textSecondary">{title}</Typography>
                  <Typography variant="h5">{value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Earnings Overview
            </Typography>
            <Box height={300}>
              <EarningsOverviewChart data={stats.mrrByMonth} />
            </Box
          >
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Sources
            </Typography>
            <Box height={300}>
              <RevenueSourcesChart
                data={stats.monthlyBreakdown.map((b) => ({
                  name:  b.planName,
                  value: b.total,
                }))}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
