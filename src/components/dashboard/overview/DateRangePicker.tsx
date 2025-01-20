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
      case 'Today':
        setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 0));
        setEndDate(today);
        break;
      case 'This Week':
        setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
        setEndDate(today);
        break;
      case 'This Month':
        setStartDate(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()));
        setEndDate(today);
        break;
      case 'This Year':
        setStartDate(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()));
        setEndDate(today);
        break;
      default:
        break;
    }
  };

  const setTodayAsEndDate = () => {
    const today = new Date();
    setEndDate(today);
  };

  return (
    <div className={`${styles.card} cus-filt-prnt`}>
      <div className={`${styles.toggleButtonGroup} cus-filter`}>
        {['Today', 'This Week', 'This Month', 'This Year'].map((label) => (
          <button
            key={label}
            className={`${styles.toggleButton} ${preset === label ? styles.selected : ''}`}
            onClick={() => handlePresetChange(label)}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </button>
        ))}
      </div>
      <div className={`${styles.datePickerBox} cus-date-time`}>
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
              renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                <div className={styles.customHeaderContainer}>
                  <div className={styles.headerControls}>
                    <button onClick={decreaseMonth} className={styles.navButton}>‹</button>
                    <span className={styles.monthYearDisplay}>
                      {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                    </span>
                    <button onClick={increaseMonth} className={styles.navButton}>›</button>
                  </div>
                  <button className={styles.todayButton} onClick={setTodayAsEndDate}>
                    TODAY
                  </button>
                </div>
              )}
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
