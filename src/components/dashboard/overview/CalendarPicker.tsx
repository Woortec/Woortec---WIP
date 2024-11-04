// DatePickerComponent.tsx

'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card, CardContent, TextField, IconButton, Box } from '@mui/material';
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { useDate } from './date/DateContext';

const DatePickerComponent = () => {
  const { startDate, endDate, setStartDate, setEndDate } = useDate();

  return (
    <Card sx={{ display: 'flex', height: 59, alignItems: 'center', padding: '0 8px' }}>
      <CalendarTodayIcon sx={{ color: 'grey' }} />
      <CardContent sx={{ display: 'flex', alignItems: 'center', padding: '10 8px', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            customInput={<TextField variant="outlined" size="small" sx={{ marginRight: 1 }} />}
            dateFormat="dd MMM yyyy"
          />
          <span style={{ margin: '0 8px', color: 'grey' }}>↔</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            customInput={<TextField variant="outlined" size="small" sx={{ marginLeft: 1 }} />}
            dateFormat="dd MMM yyyy"
          />
        </Box>
        <IconButton sx={{ marginLeft: '8px' }}>
          <CalendarTodayIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default DatePickerComponent;
