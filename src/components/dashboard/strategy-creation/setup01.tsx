'use client';
// ObjectivePage.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/ObjectivePage.module.css';
import StepIndicator from './StepIndicator';
import { createClient } from '../../../../utils/supabase/client';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField
} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocale } from '@/contexts/LocaleContext';

const ObjectivePage: React.FC = () => {
  const router = useRouter();
  const { t } = useLocale();

  const [formData, setFormData] = useState({
    objective: '',
    budget: '',
    manageInquiries: '',
    trafficUrl: ''
  });

  const [currency, setCurrency] = useState<string>(''); // User's currency
  const [exchangeRate, setExchangeRate] = useState<number>(1); // Exchange rate to USD
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Validation errors

  // Fetch currency and exchange rate from Supabase
  const fetchCurrencyAndExchangeRate = async () => {
    try {
      const supabase = createClient();
      const user_id = localStorage.getItem('userid');
      if (!user_id) {
        console.error('User ID not found in localStorage');
        return;
      }

      const { data, error } = await supabase
        .from('facebookData')
        .select('currency')
        .eq('user_id', user_id)
        .single();

      if (error) {
        console.error('Error fetching currency from Supabase:', error);
      } else if (data) {
        const userCurrency = data.currency;
        setCurrency(userCurrency);
        const fetchedExchangeRate = await getExchangeRate(userCurrency);
        setExchangeRate(fetchedExchangeRate);
      } else {
        console.error('No connected ad account found for the user.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  // Fetch the currency and exchange rate on component mount
  useEffect(() => {
    fetchCurrencyAndExchangeRate();

    // only log window size on the client
    if (typeof window !== 'undefined') {
      console.log(window.innerWidth, window.innerHeight);
    }
  }, []);

  // Function to get the exchange rate to USD
  const getExchangeRate = async (currency: string): Promise<number> => {
    const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${currency}/USD`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.conversion_rate) {
        return data.conversion_rate;
      } else {
        console.error('Error fetching exchange rate:', data);
        return 1;
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return 1;
    }
  };

  // Function to format currency amounts
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    validateField(name, value);
  };

  // Validate individual form fields
  const validateField = (fieldName: string, value: string) => {
    let fieldErrors = { ...errors };

    switch (fieldName) {
      case 'objective':
        if (!value) fieldErrors.objective = 'Please select an objective.';
        else delete fieldErrors.objective;
        break;
      case 'budget':
        const budgetInUserCurrency = parseFloat(value);
        if (isNaN(budgetInUserCurrency) || budgetInUserCurrency <= 0) {
          fieldErrors.budget = 'Please enter a valid budget amount.';
        } else if (exchangeRate) {
          const budgetInUSD = budgetInUserCurrency * exchangeRate;
          if (budgetInUSD < 180) {
            const minimumBudgetInUserCurrency = 180 / exchangeRate;
            fieldErrors.budget = `The budget must be at least ${formatCurrency(minimumBudgetInUserCurrency)} ${currency}.`;
          } else {
            delete fieldErrors.budget;
          }
        }
        break;
      case 'manageInquiries':
        if (!value) fieldErrors.manageInquiries = 'Please select an option.';
        else delete fieldErrors.manageInquiries;
        break;
      case 'trafficUrl':
        if (formData.objective === 'sales' && !value) {
          fieldErrors.trafficUrl = 'Please enter a URL for the sales objective.';
        } else {
          delete fieldErrors.trafficUrl;
        }
        break;
      default:
        break;
    }

    setErrors(fieldErrors);
  };

  // Validate the entire form
  const validateForm = () => {
    let valid = true;
    let fieldErrors = { ...errors };

    if (!formData.objective) {
      fieldErrors.objective = 'Please select an objective.';
      valid = false;
    }

    const budgetInUserCurrency = parseFloat(formData.budget);
    if (isNaN(budgetInUserCurrency) || budgetInUserCurrency <= 0) {
      fieldErrors.budget = 'Please enter a valid budget amount.';
      valid = false;
    } else if (exchangeRate) {
      const budgetInUSD = budgetInUserCurrency * exchangeRate;
      if (budgetInUSD < 180) {
        const minimumBudgetInUserCurrency = 180 / exchangeRate;
        fieldErrors.budget = `The budget must be at least ${formatCurrency(minimumBudgetInUserCurrency)} ${currency}.`;
        valid = false;
      }
    }

    if (!formData.manageInquiries) {
      fieldErrors.manageInquiries = 'Please select an option.';
      valid = false;
    }

    if (formData.objective === 'sales' && !formData.trafficUrl) {
      fieldErrors.trafficUrl = 'Please enter a URL for the sales objective.';
      valid = false;
    }

    setErrors(fieldErrors);
    return valid;
  };

  // Function to store form data in Supabase
  const storeDataInSupabase = async () => {
    try {
      const supabase = createClient();
      const user_id = localStorage.getItem('userid');
      if (!user_id) {
        console.error('User ID not found in localStorage');
        return;
      }

      const { data, error } = await supabase
        .from('ads_strategy') // Use your actual table name
        .insert([{
          user_id: user_id,
          objective: formData.objective,
          budget: formData.budget,
          manage_inquiries: formData.manageInquiries,
          traffic_url: formData.trafficUrl,
        }]);

      if (error) console.error('Error inserting data:', error);
      else console.log('Data inserted:', data);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  // Handle continue button click
  const handleContinue = async () => {
    if (validateForm()) {
      await storeDataInSupabase();
      console.log('Navigating to /strategycreation');
      router.push('/dashboard/strategy/strategycreation');
    } else {
      const firstErrorField = document.querySelector(`.${styles.errorInput}`);
      if (firstErrorField) (firstErrorField as HTMLElement).focus();
    }
  };

  // Determine if the form is valid
  const isFormValid = Object.keys(errors).length === 0 &&
    formData.objective &&
    formData.budget &&
    formData.manageInquiries &&
    (formData.objective !== 'sales' || formData.trafficUrl);

  return (
    <Box className={styles.container}>
      <Box>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {t('AdsStrategy.title')}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#7a7a7a', marginTop: '0.9rem', textAlign: 'left' }}>
            {t('AdsStrategy.subtitle')}
          </Typography>
        </Box>
        <Box><StepIndicator /></Box>

        <Box className={styles.formContainer}>
          <Box sx={{ width: '45%', '@media (max-width: 1200px)': { width: '100%' } }}>
            {/* Left Column */}
            <Box className={styles.formGroup}>
              <label htmlFor="objective" className={styles.label}>
                {t('AdsStrategy.objectiveLabel')}
              </label>
              <select
                id="objective"
                name="objective"
                className={`${styles.select} ${errors.objective ? styles.errorInput : ''}`}
                value={formData.objective}
                onChange={handleInputChange}
                aria-invalid={!!errors.objective}
                aria-describedby={errors.objective ? 'objective-error' : undefined}
              >
                <option value="" disabled>{t('AdsStrategy.objectivePlaceholder')}</option>
                <option value="Brand Awareness">Enhance brand visibility and engagement</option>
                <option value="Sales">Increase website traffic and sales conversions</option>
                <option value="Lead Generation">Collect prospective customer information via a form</option>
              </select>
              {errors.objective && (
                <div id="objective-error" className={styles.errorMessage}>
                  {errors.objective}
                </div>
              )}
            </Box>

            <Box className={styles.formGroup}>
              <label className={styles.label}>
                {t('AdsStrategy.answerMessagesLabel')}
              </label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    id="yes"
                    name="manageInquiries"
                    value="yes"
                    checked={formData.manageInquiries === 'yes'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                    aria-invalid={!!errors.manageInquiries}
                    aria-describedby={errors.manageInquiries ? 'manageInquiries-error' : undefined}
                  />
                  {t('AdsStrategy.yes')}
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    id="no"
                    name="manageInquiries"
                    value="no"
                    checked={formData.manageInquiries === 'no'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                    aria-invalid={!!errors.manageInquiries}
                    aria-describedby={errors.manageInquiries ? 'manageInquiries-error' : undefined}
                  />
                  {t('AdsStrategy.no')}
                </label>
              </div>
              {errors.manageInquiries && (
                <div id="manageInquiries-error" className={styles.errorMessage}>
                  {errors.manageInquiries}
                </div>
              )}
            </Box>

            <Box className={styles.formGroup}>
              <label htmlFor="trafficUrl" className={styles.label}>
                {t('AdsStrategy.trafficLabel')}
              </label>
              <input
                type="url"
                name="trafficUrl"
                id="trafficUrl"
                className={`${styles.input} ${errors.trafficUrl ? styles.errorInput : ''}`}
                placeholder={t('AdsStrategy.trafficPlaceholder')}
                value={formData.trafficUrl}
                onChange={handleInputChange}
                aria-invalid={!!errors.trafficUrl}
                aria-describedby={errors.trafficUrl ? 'trafficUrl-error' : undefined}
              />
              {errors.trafficUrl && (
                <div id="trafficUrl-error" className={styles.errorMessage}>
                  {errors.trafficUrl}
                </div>
              )}
            </Box>
          </Box>

          <Box sx={{ width: '45%', '@media (max-width: 1200px)': { width: '100%' } }}>
            {/* Right Column */}
            <Box className={styles.formGroup}>
              <label htmlFor="budget" className={styles.label}>
                {t('AdsStrategy.budgetLabel')}
              </label>
              <div className={styles.budgetInputContainer}>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  className={`${styles.input} ${errors.budget ? styles.errorInput : ''}`}
                  placeholder={t('AdsStrategy.budgetPlaceholder')}
                  value={formData.budget}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.budget}
                  aria-describedby={errors.budget ? 'budget-error' : undefined}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.budget && (
                <div id="budget-error" className={styles.errorMessage}>
                  {errors.budget}
                </div>
              )}
            </Box>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                {t('AdsStrategy.audienceLabel')}
              </label>
              <div>
                <textarea
                  name="description"
                  id="description"
                  className={styles.describePersona}
                  placeholder={t('AdsStrategy.audiencePlaceholder')}
                />
              </div>
            </div>
          </Box>
        </Box>
      </Box>

      <div className={styles.forconButton}>
        <button
          className={styles.continueButton}
          onClick={handleContinue}
          disabled={!isFormValid}
          aria-disabled={!isFormValid}
        >
          {t('AdsStrategy.continue')}
        </button>
      </div>
    </Box>
  );
};

export default ObjectivePage;
