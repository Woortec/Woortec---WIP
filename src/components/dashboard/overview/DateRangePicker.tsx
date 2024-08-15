'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import styles from './date/style/DatePickerComponent.module.css';

interface DatePickerComponentProps {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  setEndDate: Dispatch<SetStateAction<Date | null>>;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: DatePickerComponentProps) => {
  const [preset, setPreset] = useState<string>('day');

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    const today = new Date();

    switch (newPreset) {
      case 'day':
        setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29));
        setEndDate(today);
        break;
      case 'week':
        setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
        setEndDate(today);
        break;
      case 'month':
        setStartDate(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()));
        setEndDate(today);
        break;
      case 'year':
        setStartDate(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()));
        setEndDate(today);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.toggleButtonGroup}>
        {['day', 'week', 'month', 'year'].map((label) => (
          <button
            key={label}
            className={`${styles.toggleButton} ${preset === label ? styles.selected : ''}`}
            onClick={() => handlePresetChange(label)}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </button>
        ))}
      </div>
      <div className={styles.datePickerBox}>
        <CalendarTodayIcon className={styles.calendarIcon} />
        <div className={styles.cardContent}>
          <div className={styles.datePickerContainer}>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              customInput={
                <input
                  type="text"
                  className={styles.datePickerInput}
                  value={startDate ? startDate.toDateString() : ''}
                  readOnly
                />
              }
              dateFormat="dd MMM yyyy"
            />
            <span className={styles.datePickerSeparator}>↔</span>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              customInput={
                <input
                  type="text"
                  className={styles.datePickerInput}
                  value={endDate ? endDate.toDateString() : ''}
                  readOnly
                />
              }
              dateFormat="dd MMM yyyy"
            />
          </div>
          <button className={styles.iconButton}>
            <CalendarTodayIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerComponent;
