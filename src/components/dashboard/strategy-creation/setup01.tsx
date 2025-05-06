'use client';
// ObjectivePage.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/ObjectivePage.module.css';
import StepIndicator from './StepIndicator';
import { createClient } from '../../../../utils/supabase/client';
import { Box, Typography } from '@mui/material';

const ObjectivePage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    objective: '',
    budget: '',
    manageInquiries: '',
    trafficUrl: '',
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
        setCurrency(data.currency);
        const rate = await getExchangeRate(data.currency);
        setExchangeRate(rate);
      } else {
        console.error('No connected ad account found for the user.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  useEffect(() => {
    fetchCurrencyAndExchangeRate();

    // Log viewport size only in browser
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
      return data.conversion_rate ?? 1;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return 1;
    }
  };

  const formatCurrency = (amount: number) => amount.toFixed(2);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (field: string, value: string) => {
    const errs = { ...errors };

    switch (field) {
      case 'objective':
        if (!value) errs.objective = 'Please select an objective.';
        else delete errs.objective;
        break;
      case 'budget':
        const amt = parseFloat(value);
        if (isNaN(amt) || amt <= 0) {
          errs.budget = 'Please enter a valid budget amount.';
        } else if (exchangeRate) {
          const inUsd = amt * exchangeRate;
          if (inUsd < 180) {
            const minLocal = 180 / exchangeRate;
            errs.budget = `The budget must be at least ${formatCurrency(
              minLocal
            )} ${currency}.`;
          } else delete errs.budget;
        }
        break;
      case 'manageInquiries':
        if (!value) errs.manageInquiries = 'Please select an option.';
        else delete errs.manageInquiries;
        break;
      case 'trafficUrl':
        if (formData.objective === 'sales' && !value)
          errs.trafficUrl = 'Please enter a URL for the sales objective.';
        else delete errs.trafficUrl;
        break;
    }

    setErrors(errs);
  };

  const validateForm = () => {
    let ok = true;
    const errs: typeof errors = {};

    if (!formData.objective) {
      errs.objective = 'Please select an objective.';
      ok = false;
    }
    const amt = parseFloat(formData.budget);
    if (isNaN(amt) || amt <= 0) {
      errs.budget = 'Please enter a valid budget amount.';
      ok = false;
    } else if (exchangeRate && amt * exchangeRate < 180) {
      const minLocal = 180 / exchangeRate;
      errs.budget = `The budget must be at least ${formatCurrency(
        minLocal
      )} ${currency}.`;
      ok = false;
    }
    if (!formData.manageInquiries) {
      errs.manageInquiries = 'Please select an option.';
      ok = false;
    }
    if (formData.objective === 'sales' && !formData.trafficUrl) {
      errs.trafficUrl = 'Please enter a URL for the sales objective.';
      ok = false;
    }

    setErrors(errs);
    return ok;
  };

  const storeDataInSupabase = async () => {
    try {
      const supabase = createClient();
      const user_id = localStorage.getItem('userid');
      if (!user_id) return console.error('User ID not found');

      const { error } = await supabase.from('ads_strategy').insert([
        {
          user_id,
          objective: formData.objective,
          budget: formData.budget,
          manage_inquiries: formData.manageInquiries,
          traffic_url: formData.trafficUrl,
        },
      ]);
      if (error) console.error('Error inserting data:', error);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleContinue = async () => {
    if (validateForm()) {
      await storeDataInSupabase();
      router.push('/dashboard/strategy/strategycreation');
    } else {
      const firstErr = document.querySelector(`.${styles.errorInput}`);
      firstErr && (firstErr as HTMLElement).focus();
    }
  };

  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.objective &&
    formData.budget &&
    formData.manageInquiries &&
    (formData.objective !== 'sales' || formData.trafficUrl);

  return (
    <Box className={styles.container}>
      <Box>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Strategy Creation
          </Typography>
          <Typography
            sx={{
              fontSize: '1rem',
              color: '#7a7a7a',
              marginTop: '0.9rem',
              textAlign: 'left',
            }}
          >
            Introducing Woortec - the ultimate social media ads product designed to elevate your
            online presence and drive results like never before. With Woortec, you can effortlessly
            create and manage ads across multiple social media platforms, all in one place.
          </Typography>
        </Box>
        <Box>
          <StepIndicator />
        </Box>

        <Box className={styles.formContainer}>
          {/* Left Column */}
          <Box sx={{ width: '45%', '@media (max-width: 1200px)': { width: '100%' } }}>
            {/* Objective */}
            {/* ... (same as before) */}
          </Box>

          {/* Right Column */}
          <Box sx={{ width: '45%', '@media (max-width: 1200px)': { width: '100%' } }}>
            {/* Budget & Description */}
            {/* ... (same as before) */}
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
          Continue
        </button>
      </div>
    </Box>
  );
};

export default ObjectivePage;
