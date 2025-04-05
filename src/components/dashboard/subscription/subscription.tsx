'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Container, Card, CardContent, Typography, Button, Divider, Box } from '@mui/material';
import './styles.css'; // Import the CSS file
import { CheckCircle as CircleIcon } from '@phosphor-icons/react';
import { createClient } from '../../../../utils/supabase/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Subscription = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [userUuid, setUserUuid] = useState<string | null>(null); // Store UUID from Supabase

  useEffect(() => {
    const fetchUserUuid = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserUuid(user.user_metadata?.provider_id || null);
      }
    };

    fetchUserUuid();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe has not loaded yet.');
      return;
    }

    if (!userUuid) {
      console.error('User UUID not found');
      return;
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, uuid: userUuid }), // Send UUID
    });

    if (!response.ok) {
      console.error('Failed to create checkout session');
      return;
    }

    const data = await response.json();

    if (!data || !data.sessionId) {
      console.error('Invalid session response:', data);
      return;
    }

    // Redirect to Stripe checkout
    const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });

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
    <Container className="container" sx={{ width: '100%', maxWidth: '100% !important' }}>
      <Typography variant="h2" sx={{ color: '#222222', textAlign: 'left', fontWeight: 'bold', fontSize: '1.25rem' }}>
        Choose Your Plan
      </Typography>

      <div className="toggle">
        <Box sx={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Button onClick={() => setIsYearly(false)} sx={{ width: '100%', backgroundColor: 'transparent', fontWeight: !isYearly ? '600' : '300' }}>
            Monthly
          </Button>
          <Box sx={{ pt: !isYearly ? '0px' : '4.5px', width: '100%', alignItems: 'center' }}>
            <Box sx={{ width: '100%', bgcolor: '#486A75', height: '1px', position: 'relative' }}>
              <Box sx={{ position: 'absolute', width: '100%', bgcolor: '#486A75', height: !isYearly ? '5px' : '1px', transition: 'height 0.3s ease-in-out' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Button onClick={() => setIsYearly(true)} sx={{ width: '100%', backgroundColor: 'transparent', fontWeight: isYearly ? '600' : '300' }}>
            Yearly
          </Button>
          <Box sx={{ pt: isYearly ? '0px' : '4px', width: '100%', alignItems: 'center' }}>
            <Box sx={{ width: '100%', bgcolor: '#486A75', height: '1px', position: 'relative' }}>
              <Box sx={{ position: 'absolute', width: '100%', bgcolor: '#486A75', height: isYearly ? '5px' : '1px', transition: 'height 0.3s ease-in-out' }} />
            </Box>
          </Box>
        </Box>
      </div>

      <div className="grid-container">
        {plans.map((plan) => (
          <Card className="card" sx={{ backgroundColor: plan.name === "Essential" ? "#486A75" : "white", color: plan.name === "Essential" ? "white" : "#486A75", pb: '1rem' }} key={plan.id}>
            <CardContent className="card-content">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  {plan.name}
                </Typography>
                {plan.name === "Essential" && (
                  <Typography sx={{ backgroundColor: '#F2F4F5', color: '#486A75', padding: '0.5% 1%', borderRadius: '4px', fontSize: '80%' }}>
                    Popular
                  </Typography>
                )}
              </Box>
              <Typography variant="h6" component="p" className="price">
                {plan.price}
              </Typography>
              <Divider sx={{ my: 2 }}></Divider>
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li className="feature-item" key={index}>
                    <CircleIcon size={20}></CircleIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', textAlign: 'left' }}>
                      {feature}
                    </Typography>
                  </li>
                ))}
              </ul>
            </CardContent>
            <Box sx={{ justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => handleSubscribe(plan.id)} sx={{ backgroundColor: plan.name === "Essential" ? "#86F5A6" : "white", color: "#486A75", border: "2px solid #486A75", width: '80%' }}>
                Choose Plan
              </Button>
            </Box>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default Subscription;