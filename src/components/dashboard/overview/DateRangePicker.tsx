'use client';

import React from 'react';
import { ToggleButton, ToggleButtonGroup, Card, CardContent, Box } from '@mui/material';

interface DateRangePickerProps {
  timeRange: string;
  setTimeRange: (newRange: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ timeRange, setTimeRange }) => {
  return (
    <Card sx={{ padding: 1, borderRadius: '15px', height: 59, boxShadow: 'none', border: '1px solid #E0E0E0' }}>
      <CardContent sx={{ padding: 0 }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_e, newRange) => {
              if (newRange !== null) {
                setTimeRange(newRange);
              }
            }}
            aria-label="Time Range"
            sx={{
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#5f6368',
                '&.Mui-selected': {
                  backgroundColor: '#E0E0E0',
                  color: '#486A75',
                  fontWeight: 'bold',
                },
                '&:hover': {
                  backgroundColor: '#F1F3F4',
                },
                '&.MuiToggleButtonGroup-grouped:not(:last-of-type)': {
                  marginRight: 1,
                },
              },
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <ToggleButton value="day" aria-label="Day">Day</ToggleButton>
            <ToggleButton value="week" aria-label="Week">Week</ToggleButton>
            <ToggleButton value="month" aria-label="Month">Month</ToggleButton>
            <ToggleButton value="year" aria-label="Year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </CardContent>
    </Card>
  );
};
