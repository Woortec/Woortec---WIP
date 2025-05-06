'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface Point { month: string; revenue: number; }

interface Props {
  data: Point[];
  deltaPercent: number;    // e.g. +2.6
}

export function EarningsOverviewChart({ data, deltaPercent }: Props) {
  const theme = useTheme();
  const latest = data[data.length - 1]?.revenue ?? 0;

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>Earnings Overview</Typography>
          <Box display="flex" alignItems="center">
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mt: 2, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: theme.palette.text.secondary }} />
              <YAxis tick={{ fill: theme.palette.text.secondary }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={theme.palette.primary.main}
                fill="url(#earningsGradient)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
