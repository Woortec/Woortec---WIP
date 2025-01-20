'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Stripe from 'stripe';
import styles from './SuccessPage.module.css';

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

  useEffect(() => {
    //  if payment is successful
    if (session && session.payment_status === 'paid') {
      // Redirect to dashboard
      router.push('/dashboard');
    }
  }, [session, router]);

  if (!session) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Payment Successful!</h1>
        <p className={styles.message}>Thank you for your payment!</p>
        <div className={styles.details}>
          <p><strong>Session ID:</strong> {session.id}</p>
          <p><strong>Amount Paid:</strong> ${(session.amount_total / 100).toFixed(2)} {session.currency.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
