// app/admin/page.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Container,
  CircularProgress,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon   from '@mui/icons-material/AttachMoney';
import PeopleIcon        from '@mui/icons-material/People';
import BoltIcon          from '@mui/icons-material/Bolt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { StatCard }                 from './components/StatCard';
import { EarningsOverviewChart }    from './components/EarningsOverviewChart';
import { RevenueSourcesChart }      from './components/RevenueSourcesChart';

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
}

export default function AdminPage() {
  const [stats, setStats]             = useState<Stats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  // 1) Load dashboard stats
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
        console.error(err);
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  // 2) Handle PDF generation
  const handleGenerateReport = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const ratio    = imgProps.width / imgProps.height;
    let   w        = pdfW - 40;
    let   h        = w / ratio;
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

  // KPI cards data
  const kpis = [
    {
      title: 'Earnings (Monthly)',
      value: `$${stats.monthlyEarnings.toLocaleString()}`,
      icon:  <CalendarMonthIcon fontSize="large" sx={{ color: '#6366F1' }} />,
    },
    {
      title: 'Earnings (Annual)',
      value: `$${stats.annualEarnings.toLocaleString()}`,
      icon:  <AttachMoneyIcon fontSize="large" sx={{ color: '#10B981' }} />,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon:  <PeopleIcon fontSize="large" sx={{ color: '#3B82F6' }} />,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon:  <BoltIcon fontSize="large" sx={{ color: '#F59E0B' }} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Always show this – admin pages are already protected */}
      <Box textAlign="right" mb={2}>
        <Button variant="contained" onClick={handleGenerateReport}>
          Generate Report
        </Button>
      </Box>

      {/* Dashboard content */}
      <div ref={reportRef}>
        <Grid container justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h4">Dashboard</Typography>
        </Grid>
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Updated: {lastUpdated}
          </Typography>
        )}

        <Grid container spacing={2} mb={4}>
          {kpis.map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <StatCard
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                accent={(['indigo','green','teal','yellow'] as const)[i]}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, height: { xs: 240, md: 320 } }}>
              <Typography variant="h6" gutterBottom>
                Earnings Overview
              </Typography>
              <Box sx={{ height: 'calc(100% - 32px)' }}>
                <EarningsOverviewChart data={stats.mrrByMonth} />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, height: { xs: 240, md: 320 } }}>
              <Typography variant="h6" gutterBottom>
                Revenue Sources
              </Typography>
              <Box sx={{ height: 'calc(100% - 32px)' }}>
                <RevenueSourcesChart
                  data={stats.monthlyBreakdown.map(b => ({
                    name:  b.planName,
                    value: b.total,
                  }))}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
}
