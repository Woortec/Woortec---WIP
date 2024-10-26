'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const SuccessPage = () => {
  const router = useRouter();
  const { session_id } = router.query;
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (session_id) {
      fetchSessionDetails(session_id as string);
    }
  }, [session_id]);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe-session/${sessionId}`);
      const sessionData = await response.json();
      setSession(sessionData);
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your payment!</p>
      <p>Session ID: {session.id}</p>
      <p>Amount Paid: {(session.amount_total / 100).toFixed(2)} {session.currency.toUpperCase()}</p>
    </div>
  );
};

export default SuccessPage;
