'use client'

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles/Preparing.module.css';
import withAuth from '@/components/withAuth';

const Preparing: React.FC = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const nextPage = location.state?.next;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      clearInterval(timer);
      if (nextPage === 'launching') {
        navigate('/dashboard/launching');
      } else if (nextPage === 'analysis') {
        navigate('/dashboard/analysis');
      }
    }

    return () => clearInterval(timer);
  }, [countdown, navigate, nextPage]);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Campaign Setup: Strategy Name</h1>
      <p className={styles.description}>
        We are now processing your ad strategy, taking into account your unique business goals and target audience. Our expert team is dedicated to helping you achieve maximum ROI with minimal effort. With Woortec, you can rest assured that your social media advertising is in good hands.
      </p>
      <img 
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/4a2f3184d4ef958bd3dd1edf677862e462bba610f55e2c8d33b65ced3cfe5732?apiKey=415fe05812414bd2983a5d3a1f882fdf&&apiKey=415fe05812414bd2983a5d3a1f882fdf" 
        alt="Campaign setup processing illustration" 
        className={styles.processingImage} 
      />
      <p className={styles.processingText}>Processing Your Campaign Setup</p>
      <p className={styles.processingText}>Countdown: {countdown} seconds</p>
    </main>
  );
}

export default withAuth(Preparing);
