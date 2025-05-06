'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Breadcrumbs,
  Link as MUILink,
  Typography,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip as ReTooltip,
} from 'recharts';

import { EarningsOverviewChart } from './components/EarningsOverviewChart';
import { RevenueSourcesChart } from './components/RevenueSourcesChart';

interface BreakdownItem {
  planName: string;
  count: number;
  total: number;
}
interface Stats {
  totalUsers: number;
  activeUsers: number;
  monthlyEarnings: number;
  annualEarnings: number;
  mrrByMonth: { month: string; revenue: number }[];
  monthlyBreakdown: BreakdownItem[];
}
interface SparkKPI {
  title: string;
  value: string;
  percent: string;
  data: number[];
  color: string;
}

export default function AdminPage() {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

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
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateReport = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const { width: pdfW, height: pdfH } = pdf.internal.pageSize;
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = imgProps.width / imgProps.height;
    let w = pdfW - 40;
    let h = w / ratio;
    if (h > pdfH - 40) {
      h = pdfH - 40;
      w = h * ratio;
    }
    pdf.setFontSize(20);
    pdf.text('Woortec Admin Report', pdfW / 2, 30, { align: 'center' });
    pdf.setFontSize(11);
    pdf.text(`Generated: ${lastUpdated}`, pdfW / 2, 48, { align: 'center' });
    pdf.addImage(imgData, 'PNG', (pdfW - w) / 2, 60, w, h);
    pdf.save(`woortec-report-${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !stats) {
    return (
      <Box sx={{ width: '100%', py: 10, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const sparkKPIs: SparkKPI[] = [
    {
      title: 'Earnings (Monthly)',
      value: `$${stats.monthlyEarnings.toLocaleString()}`,
      percent: '+30.6%',
      data: stats.mrrByMonth.map((m) => m.revenue),
      color: theme.palette.primary.main,
    },
    {
      title: 'Earnings (Annual)',
      value: `$${stats.annualEarnings.toLocaleString()}`,
      percent: '+18.2%',
      data: stats.mrrByMonth.map((_, i) => (i % 2 ? stats.annualEarnings / 12 : 0)),
      color: theme.palette.success.main,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      percent: '+12.4%',
      data: stats.mrrByMonth.map((_, i) => (stats.totalUsers / stats.mrrByMonth.length) * (i + 1)),
      color: theme.palette.info.main,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toString(),
      percent: '+5.1%',
      data: stats.mrrByMonth.map((_, i) => (stats.activeUsers / stats.mrrByMonth.length) * (i + 1)),
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<ChevronRightIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <MUILink
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => (window.location.href = '/admin')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </MUILink>
        <Typography color="text.primary">Dashboard</Typography>
      </Breadcrumbs>

      {/* Header row */}
      <Box mb={{ xs: 1, sm: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
          </Grid>
          <Grid item>
            <Box display="flex" alignItems="center" gap={2}>
              <Button size="small" variant="contained" onClick={handleGenerateReport}>
                Generate Report
              </Button>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary">
                  Updated: {lastUpdated}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <div ref={reportRef}>
        {/* KPI Cards */}
        <Grid container spacing={{ xs: 1, sm: 2 }} mb={{ xs: 2, sm: 4 }}>
          {sparkKPIs.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.title}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, position: 'relative' }}>
                  <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                    {kpi.title}
                  </Typography>
                  <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Box display="flex" alignItems="baseline" mt={1} mb={1}>
                    <Typography variant="h6" fontWeight={600} mr={1}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="body2" color={kpi.color}>
                      {kpi.percent}
                    </Typography>
                  </Box>
                  <Box sx={{ height: { xs: 50, sm: 60 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kpi.data.map((v, i) => ({ x: i, y: v }))}>
                        <ReTooltip
                          formatter={(v: number) => v.toLocaleString()}
                          cursor={false}
                          contentStyle={{ display: 'none' }}
                        />
                        <Bar dataKey="y" fill={kpi.color} barSize={4} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Charts */}
        <Grid container spacing={{ xs: 1, sm: 2 }} rowSpacing={{ xs: 2, md: 0 }}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: { xs: 1, sm: 2 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <EarningsOverviewChart
                data={stats.mrrByMonth}
                deltaPercent={
                  (stats.mrrByMonth.slice(-1)[0].revenue /
                    stats.mrrByMonth[0].revenue -
                    1) *
                  100
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: { xs: 1, sm: 2 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <RevenueSourcesChart
                data={stats.monthlyBreakdown.map((b) => ({
                  name: b.planName,
                  value: b.total,
                  delta: b.count,
                }))}
              />
            </Box>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
}
