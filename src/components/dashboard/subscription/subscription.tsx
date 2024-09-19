'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Container, Card, CardContent, Typography, Button, Switch, FormControlLabel, Checkbox } from '@mui/material';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client'; // Adjust the path as needed
import './styles.css'; // Import the CSS file

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Subscription = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Supabase client initialization
  const supabase = createClient();

  // Check if the user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    // If the user is not logged in, redirect them to the sign-in page with a redirect back to this page
    if (!isLoggedIn) {
      router.push(`/auth/sign-in?redirect=/dashboard/subscription`);
      return;
    }
  
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
      id: isYearly ? 'price_1Q0evMHow0UPMFTy7WwmoxcI' : 'price_1Q0evoHow0UPMFTyzK1fRTYm',
      name: 'Basic',
      price: isYearly ? '₱16,800.00/year' : '₱1,700.00/month',
      features: [
        'Daily Report',
        'Performance Optimization',
        'Event Calendar Alerts',
        'In-depth Ad Analysis',
      ],
    },
    {
      id: isYearly ? 'price_1Q0ezLHow0UPMFTylKWCd7E7' : 'price_1Q0ezjHow0UPMFTyW1A6oNiT',
      name: 'Essential',
      price: isYearly ? '₱28,800.00/year' : '₱2,850.00/month',
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
      id: isYearly ? 'price_1Q0exJHow0UPMFTyCgaPtHGm' : 'price_1Q0exxHow0UPMFTy8ccU5P8t',
      name: 'Advanced',
      price: isYearly ? '₱40,800.00/year' : '₱4,000.00/month',
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
