// src/components/DatePickerComponent.tsx

'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { CalendarBlank as CalIcon } from '@phosphor-icons/react';
import styles from './date/style/DatePickerComponent.module.css';

// ─── NEW: import translation hook ───────────────────────────────────────────────
import { useLocale } from '@/contexts/LocaleContext';

interface DatePickerComponentProps {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  setEndDate: Dispatch<SetStateAction<Date | null>>;
  timeRange?: string;
  setTimeRange?: Dispatch<SetStateAction<string>>;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  timeRange,
  setTimeRange,
}) => {
  // ─── NEW: get t() ───────────────────────────────────────────────────────────
  const { t } = useLocale();

  const [preset, setPreset] = useState<string>(t('DatePicker.presets.thisWeek'));

  console.log(startDate);
  console.log(endDate);
  
  
  useEffect(() => {
    // Set default to "This Week" only on first mount
    const today = new Date();
    setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
    setEndDate(today);
    if (setTimeRange) {
      setTimeRange('thisWeek');
    }
  }, []); // Empty dependency array - only run on mount

  const handlePresetChange = (newPreset: string) => {
    console.log('📅 Date picker preset changed to:', newPreset);
    setPreset(newPreset);
    const today = new Date();

    let newStartDate: Date;
    let newEndDate: Date = today;
    let newTimeRange: string = 'custom';

    switch (newPreset) {
      case t('DatePicker.presets.today'):
        newStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        newTimeRange = 'today';
        break;
      case t('DatePicker.presets.thisWeek'):
        newStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        newTimeRange = 'thisWeek';
        break;
      case t('DatePicker.presets.thisMonth'):
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        newTimeRange = 'thisMonth';
        break;
      case t('DatePicker.presets.thisYear'):
        newStartDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        newTimeRange = 'thisYear';
        break;
      default:
        return;
    }

    console.log('📅 Setting new dates and time range:', {
      preset: newPreset,
      startDate: newStartDate.toISOString().split('T')[0],
      endDate: newEndDate.toISOString().split('T')[0],
      timeRange: newTimeRange
    });

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    if (setTimeRange) {
      setTimeRange(newTimeRange);
    }
  };

  const setTodayAsEndDate = () => {
    setEndDate(new Date());
  };

  // build the array of translated preset labels
  const presetLabels = [
    t('DatePicker.presets.today'),
    t('DatePicker.presets.thisWeek'),
    t('DatePicker.presets.thisMonth'),
    t('DatePicker.presets.thisYear'),
  ];

  return (
    <div className={styles.card}>
      <div className={styles.toggleButtonGroup}>
        {presetLabels.map((label) => (
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

        {/* ─── REPLACED hard‐coded arrow with translation ───────────────────────────── */}
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
