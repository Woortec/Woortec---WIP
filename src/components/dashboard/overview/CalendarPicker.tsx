// DatePickerComponent.tsx

'use client'; 

import React from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import { Card, CardContent, TextField, IconButton, Box } from '@mui/material';
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material';

import { useDate } from './date/DateContext';
const DatePickerComponent = () => {
  // Extracting startDate, endDate, and their respective setters from the context.
  const { startDate, endDate, setStartDate, setEndDate } = useDate();

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        height: 59, 
        alignItems: 'center', 
        padding: '0 8px' 
      }}
      // It’s styled to have a consistent height and vertical alignment.
    >
      <CalendarTodayIcon sx={{ color: 'grey' }} />
      {/* A small calendar icon at the start for visual cues. */}

      <CardContent 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10 8px', 
          flexGrow: 1 
        }}
        // The CardContent holds the date pickers and another icon button. 
        // flexGrow: 1 ensures it expands to fill remaining horizontal space.
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1 
          }}
          // A Box (MUI's generic container) to line up the two date pickers horizontally.
        >
          <DatePicker
            selected={startDate}
            // The currently selected start date is provided here.
            onChange={(date: Date | null) => setStartDate(date)}
            // When the user picks a date, we update the context's startDate state.
            customInput={
              <TextField 
                variant="outlined" 
                size="small" 
                sx={{ marginRight: 1 }} 
              />
            }
            // Here we pass a custom input component (MUI TextField) to the DatePicker, 
            // ensuring styling and integration with Material UI’s look and feel.
            dateFormat="dd MMM yyyy"
            // The displayed date format is set to something readable (e.g., "12 Dec 2023").
          />

          <span style={{ margin: '0 8px', color: 'grey' }}>↔</span>
          {/* A visual separator (arrow) between the two date fields. 
              The inline styles handle simple spacing and color. */}

          <DatePicker
            selected={endDate}
            // The currently selected end date is provided here.
            onChange={(date: Date | null) => setEndDate(date)}
            // When a new date is selected, we update the context’s endDate state.
            customInput={
              <TextField 
                variant="outlined" 
                size="small" 
                sx={{ marginLeft: 1 }} 
              />
            }
            // Another custom input text field for end date, separated by left margin to keep spacing consistent.
            dateFormat="dd MMM yyyy"
            // Same date format for consistency.
          />
        </Box>

        <IconButton sx={{ marginLeft: '8px' }}>
          <CalendarTodayIcon />
          {/* A second calendar icon that could be used as a trigger for toggling the date picker 
              or clearing dates. Currently, it just serves as a clickable icon for further functionality. */}
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default DatePickerComponent;