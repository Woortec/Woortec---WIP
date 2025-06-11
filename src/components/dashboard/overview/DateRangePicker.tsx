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
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  // ─── NEW: get t() ───────────────────────────────────────────────────────────
  const { t } = useLocale();

  const [preset, setPreset] = useState<string>(t('DatePicker.presets.thisWeek'));

  useEffect(() => {
    // Set default to "This Week"
    const today = new Date();
    setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
    setEndDate(today);
  }, [setStartDate, setEndDate]);

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    const today = new Date();

    switch (newPreset) {
      case t('DatePicker.presets.today'):
        setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
        setEndDate(today);
        break;
      case t('DatePicker.presets.thisWeek'):
        setStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
        setEndDate(today);
        break;
      case t('DatePicker.presets.thisMonth'):
        setStartDate(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()));
        setEndDate(today);
        break;
      case t('DatePicker.presets.thisYear'):
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
