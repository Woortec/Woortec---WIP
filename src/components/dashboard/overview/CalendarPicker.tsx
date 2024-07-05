// components/CalendarPicker.tsx
'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export interface CalendarPickerProps {
  onDateChange: (dateRange: [Date | null, Date | null]) => void;
}

const CalendarPicker = ({ onDateChange }: CalendarPickerProps): React.JSX.Element => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);
    onDateChange([new Date(newStartDate), new Date(endDate)]);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = event.target.value;
    setEndDate(newEndDate);
    onDateChange([new Date(startDate), new Date(newEndDate)]);
  };

  return (
    <Box>
      <TextField
        label="Start Date"
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
        InputLabelProps={{ shrink: true }}
      />
      <Box sx={{ mx: 2 }}> to </Box>
      <TextField
        label="End Date"
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  );
};

export default CalendarPicker;
