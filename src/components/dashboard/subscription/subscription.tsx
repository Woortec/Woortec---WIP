'use client';

import React, { useState } from 'react';
import { Button, Card, CardContent, Checkbox, Container, FormControlLabel, Switch, Typography } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

import { createClient } from '../../../../utils/supabase/client';

import './styles.css'; // Import the CSS file

import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import { custom } from 'zod';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Subscription = async () => {
  const supabase = createClient();

  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe has not loaded yet.');
      return;
    }
    const { data } = await supabase.auth.getSession();
    const userEmail = data.session.user.email;
    const { data: customerData, error: customerError } = await supabase
      .from('user')
      .select('*')
      .eq('email', userEmail)
      .single();
    const customerId = customerData.customerId;
    console.log(customerId);
    const response = await axios.post(
      '/api/checkout',
      {
        priceId: priceId,
        customerId: customerId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.data.url) {
      console.log(response.data);
      window.location.href = response.data.url;
    }

    // if (response.status !== 200) {
    //   console.error('Failed to create checkout session');
    //   return;
    // }

    // const session = await response.json();

    // const result = await stripe.redirectToCheckout({
    //   sessionId: session.id,
    // });
  };

  const cancelPlan = async (subscriptionId: string) => {
    const stripe = await axios.post('/api/subscription/cancel', {
      subscriptionId: subscriptionId,
    });
  };

  const plans = [
    {
      id: isYearly ? 'price_1P90eAHow0UPMFTymffkim7t' : 'price_1P90eAHow0UPMFTyqjjSmILe',
      name: 'Basic',
      price: isYearly ? '$99.95/year' : '$9.95/month',
      features: ['Daily Report', 'Performance Optimization', 'Event Calendar Alerts', 'In-depth Ad Analysis'],
    },
    {
      id: isYearly ? 'price_1P90fvHow0UPMFTyd5EhwbLb' : 'price_1P90fUHow0UPMFTySLCkN5zi',
      name: 'Essential',
      price: isYearly ? '$99.95/year' : '$9.95/month',
      features: [
        'Personalized Advertising Roadmap',
        'Objective Definition and Alignment',
        'Strategy Adaptations and Updates',
        'Detailed Performance Analytics',
        'Budget Forecasting and Control',
        'Buyer Persona Generator',
      ],
    },
    {
      id: isYearly ? 'price_1P90ghHow0UPMFTyHnTjU8fC' : 'price_1P90gTHow0UPMFTysPFkXR95',
      name: 'Advanced',
      price: isYearly ? '$99.95/year' : '$9.95/month',
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
    <Container className="container">
      <Typography variant="h4" component="h1" gutterBottom>
        Choose Your Plan
      </Typography>
      <div className="toggle">
        <FormControlLabel
          control={
            <Switch
              checked={isYearly}
              onChange={() => setIsYearly((prev) => !prev)}
              name="togglePlan"
              color="primary"
            />
          }
          label="Yearly"
        />
      </div>
      <div className="grid-container">
        {plans.map((plan) => (
          <Card className="card" key={plan.id}>
            <CardContent className="card-content">
              <Typography variant="h5" component="h2" gutterBottom>
                {plan.name}
              </Typography>
              <Typography variant="h6" component="p" className="price">
                {plan.price}
              </Typography>
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li className="feature-item" key={index}>
                    <Checkbox className="feature-checkbox" checked={true} disabled />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <Button variant="contained" className="button" onClick={() => handleSubscribe(plan.id)}>
              Subscribe to this Plan
            </Button>
          </Card>
        ))}
      </div>
      <Button variant="contained" className="button" onClick={() => cancelPlan('SUBSCRIPTIONID')}>
        cancelPlan
      </Button>
    </Container>
  );
};

export default Subscription;
