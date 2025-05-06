//src/app/admin/components/StatCard.tsx

'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  SxProps,
  Theme,
} from '@mui/material';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: 'indigo' | 'green' | 'teal' | 'yellow';
}

const accentColors: Record<NonNullable<StatCardProps['accent']>, string> = {
  indigo: '#6366F1',
  green:  '#10B981',
  teal:   '#14B8A6',
  yellow: '#F59E0B',
};

export function StatCard({
  title,
  value,
  icon,
  accent = 'indigo',
}: StatCardProps) {
  const borderColor = accentColors[accent];

  const sxCard: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    borderLeft: `4px solid ${borderColor}`,
    boxShadow: 1,
    bgcolor: 'background.paper',
    height: '100%',
  };

  return (
    <Card sx={sxCard}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {icon && (
          <Box mr={2} sx={{ fontSize: 36, color: 'text.secondary' }}>
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="overline" display="block" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
