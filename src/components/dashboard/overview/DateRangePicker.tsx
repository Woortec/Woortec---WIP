import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { CalendarBlank as CalIcon } from '@phosphor-icons/react';
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
}) => {
  const [preset, setPreset] = useState<string>('This Week');

  useEffect(() => {
    // Set "This Week" as the default selection
    const today = new Date();
    setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
    setEndDate(today);
  }, [setStartDate, setEndDate]);

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    const today = new Date();

    switch (newPreset) {
      case 'Today':
        setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
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
    setEndDate(new Date());
  };

  return (
    <div className={styles.card}>
      <div className={styles.toggleButtonGroup}>
        {['Today', 'This Week', 'This Month', 'This Year'].map((label) => (
          <button
            key={label}
            className={`${styles.toggleButton} ${preset === label ? styles.selected : ''}`}
            onClick={() => handlePresetChange(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Calendar Picker */}
      <div className={styles.datePickerBox}>
        <div className={styles.leftdatePickerContainer}>
          <CalIcon />
          
          {/* Start Date Picker */}
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            dateFormat="dd MMM yyyy"
            className={styles.datePickerInput}
            calendarClassName="left-datepicker-popup"
          />
        </div>

        <div className={styles.datePickerSeparator}>↔</div>

        <div className={styles.rightdatePickerContainer}>
          {/* End Date Picker */}
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            dateFormat="dd MMM yyyy"
            className={styles.datePickerInput}
            calendarClassName="right-datepicker-popup"
          />

          <button onClick={setTodayAsEndDate}>
            <CalIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerComponent;
