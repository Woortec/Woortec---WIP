'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Container, Card, CardContent, Typography, Button, Switch, FormControlLabel, Checkbox } from '@mui/material';
import './styles.css'; // Import the CSS file

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

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  const plans = [
    {
      id: isYearly ? 'price_1QDjDqHow0UPMFTyFVrpzNPc' : 'price_1QDjDqHow0UPMFTyFVrpzNPc',
      name: 'Basic',
      price: isYearly ? '$299.99/year' : '$29.99/month',
      features: [
        'Daily Reports',
        'Performance Optimization',
        'Event Calendar Alerts',
        'In-depth Ad Analysis',
      ],
    },
    {
      id: isYearly ? 'price_1Q008uHow0UPMFTyp6ifXtV3' : 'price_1Q009rHow0UPMFTyyxea5LzG',
      name: 'Essential',
      price: isYearly ? '$499.98/year' : '$49.98/month',
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
      id: isYearly ? 'price_1Q00CeHow0UPMFTywnltJFXW' : 'price_1Q00D5How0UPMFTyI3zY6QCr',
      name: 'Advanced',
      price: isYearly ? '$699.97/year' : '$69.97/month',
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
            <Button
              variant="contained"
              className="button"
              onClick={() => handleSubscribe(plan.id)}
            >
              Subscribe to this Plan
            </Button>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default Subscription;
