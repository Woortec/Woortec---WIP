'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styles from './Subscription.module.css';
import { Typography, Button, Switch, FormControlLabel } from '@mui/material';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Subscription = () => {
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe has not loaded yet.');
      return;
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    if (response.status !== 200) {
      console.error('Failed to create checkout session');
      return;
    }

    const session = await response.json();
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  const plans = [
    {
      id: 'price_monthly_basic',
      name: 'Basic',
      price: isYearly ? '299,99€ /year' : '29,99€ /month',
      features: ['Daily report', 'Performance Optimization', 'Event Calendar Alerts', 'In-depth Ad Analysis'],
    },
    {
      id: 'price_monthly_essential',
      name: 'Essential',
      price: isYearly ? '499,98€ /year' : '49,98€ /month',
      features: [
        'Personalized Advertising Roadmap',
        'Objective Definition and Alignment',
        'Strategy Adaptations and Updates',
        'Detailed Performance Analytics',
        'Budget Forecasting and Control',
        'Buyer Persona Generator',
      ],
      popular: true,
    },
    {
      id: 'price_monthly_advanced',
      name: 'Advanced',
      price: isYearly ? '699,97€ /year' : '69,97€ /month',
      features: [
        'Full-Service Advertising Management',
        'Monthly Performance Reports',
        'Ad Placement and Scheduling',
        'Budget Management',
        'Performance Monitoring and Optimization',
        'Complete Campaign Documentation',
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        Choose Your Plan
      </Typography>
      <div className={styles.toggleContainer}>
        <FormControlLabel
          control={<Switch checked={isYearly} onChange={() => setIsYearly(!isYearly)} />}
          label="Monthly  |  Yearly"
        />
      </div>
      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.planCard} ${plan.popular ? styles.popularCard : ''}`}
          >
            {plan.popular && <div className={styles.popularBadge}>Popular</div>}
            <Typography className={styles.planName}>{plan.name}</Typography>
            <Typography className={styles.planPrice}>{plan.price}</Typography>
            <ul className={styles.featureList}>
              {plan.features.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  <span className={styles.checkmark}>✓</span> {feature}
                </li>
              ))}
            </ul>
            <Button variant="contained" className={styles.chooseButton} onClick={() => handleSubscribe(plan.id)}>
              Choose Plan
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
