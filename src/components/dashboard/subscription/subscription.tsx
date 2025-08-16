'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Container, Card, CardContent, Typography, Button, Switch, FormControlLabel, Checkbox, Divider, Box } from '@mui/material';
import './styles.css'; // Import the CSS file
import { CheckCircle as CircleIcon } from '@phosphor-icons/react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Subscription = () => {
  const [isYearly, setIsYearly] = useState(false);
  const handleSubscribe = async (priceId: string) => {
    const stripe = await stripePromise;
  
    if (!stripe) {
      console.error('Stripe has not loaded yet.');
      return;
    }
  
    const tokenRaw = localStorage.getItem('sb-uvhvgcrczfdfvoujarga-auth-token');

    if (!tokenRaw) {
      console.error('Auth token not found in localStorage');
      return;
    }
    
    let userUuid;
    try {
      const token = JSON.parse(tokenRaw);
      userUuid = token.user?.id;
    } catch (err) {
      console.error('Failed to parse Supabase auth token', err);
      return;
    }
    
    if (!userUuid) {
      console.error('User ID not found in Supabase auth token');
      return;
    }
    
  
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, uuid: userUuid }), // Send uuid
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
  
    // Ensure sessionId is correctly used
    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId, 
    });
  
    if (result.error) {
      console.error(result.error.message);
    }
  };
  
  

  const plans = [
    {
      id: isYearly ? 'price_1P90eAHow0UPMFTymffkim7t' : 'price_1P90eAHow0UPMFTyqjjSmILe',
      name: 'Basic',
      price: isYearly ? '$24.99/month' : '$29.99/month',
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
      price: isYearly ? '+$16.66/month' : '+$19.99/month',
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
      price: isYearly ? '+$16.66/month' : '+$19.99/month',
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
    <Container className="container" sx={{width:'100%', maxWidth: '100% !important',}}>
      <Typography variant="h2" sx={{color:'#222222', textAlign:'left', fontWeight:'bold', fontSize: '1.25rem',}}>
        Choose Your Plan
      </Typography>

      <div className="toggle">
  <Box sx={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Button
      onClick={() => setIsYearly(false)}
      sx={{
        width: '100%',
        backgroundColor: 'transparent',
        color: !isYearly ? '#486A75' : '#486A75',
        fontWeight: !isYearly ? '600' : '300',
      }}
    >
      Monthly
    </Button>
    
   <Box sx={{pt: !isYearly ? '0px' : '4.5px', width: '100%', alignItems:'center'}}>
    <Box
      sx={{
        width: '100%',
        bgcolor: '#486A75',
        height: '1px', // Always keep the thin line
        position: 'relative',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          bgcolor: '#486A75',
          height: !isYearly ? '5px' : '1px', // Transition to 5px when active
          transition: 'height 0.3s ease-in-out',
        }}
      />
    </Box>
    </Box> 
  </Box>

  <Box sx={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Button
      onClick={() => setIsYearly(true)}
      sx={{
        width: '100%',
        backgroundColor: 'transparent',
        color: isYearly ? '#486A75' : '#486A75',
        fontWeight: isYearly ? '600' : '300',
      }}
    >
      Yearly
    </Button>

    <Box sx={{ pt: isYearly ? '0px' : '4px', width: '100%', alignItems:'center'}}>
    <Box
      sx={{
        width: '100%',
        bgcolor: '#486A75',
        height: '1px', // Always keep the thin line
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          bgcolor: '#486A75',
          height: isYearly ? '5px' : '1px', // Transition to 5px when active
          transition: 'height 0.3s ease-in-out',
        }}
      />
      </Box>
    </Box>
    </Box>
</div>

      <div className="grid-container">
        {plans.map((plan) => (
          <Card className="card" sx={{ backgroundColor: plan.name === "Essential" ? "#486A75" : "white",
            color: plan.name === "Essential" ? "white" : "#486A75", padding:'0', pb:'1rem',
            fontWeight: '200',
           }} key={plan.id}>
            <CardContent className="card-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {plan.name}
              </Typography>
              {plan.name === "Essential" && (
                <Typography sx={{
                  backgroundColor: '#F2F4F5',
                  color: '#486A75',
                  padding: '0.5% 1%',
                  borderRadius: '4px',
                  fontSize: '80%',
                }}>
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
            <Box sx={{justifyContent:'center'}}>
            <Button
              variant="contained"
              onClick={() => handleSubscribe(plan.id)}
              sx={{backgroundColor: plan.name === "Essential" ? "#86F5A6" : "white",
                color: plan.name === "Essential" ? "#486A75" : "#486A75",
                border: "2px solid #486A75",
                width:'80%',
                "&:hover": {
                  backgroundColor: plan.name === "Essential" ? "#F0F0F0" : "#F0F0F0",
                },
              }}
            >
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
