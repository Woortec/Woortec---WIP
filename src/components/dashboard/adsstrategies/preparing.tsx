/// src/components/dashboard/adsstrategies/preparing.tsx

'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '../../withAuth';
import styles from './styles/Preparing.module.css';

const Preparing: React.FC = () => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const savedTime = localStorage.getItem('preparingStartTime');
    if (!savedTime) {
      router.push('/dashboard/adsstrategies');
      return;
    }

    const startTime = new Date(savedTime);
    const checkTime = () => {
      const currentTime = new Date();
      const diff = currentTime.getTime() - startTime.getTime();
      const remainingTime = 5 * 60 * 1000 - diff; // 5 minutes in milliseconds

      if (remainingTime <= 0) {
        localStorage.removeItem('preparingStartTime');
        router.push('/dashboard/adsstrategies/launching');
      } else {
        setTimeLeft(remainingTime);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const formatTimeLeft = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const progressPercentage = timeLeft !== null ? (300000 - timeLeft) / 3000 : 0;

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
      {timeLeft !== null && (
        <>
          <p className={styles.processingText}>Time left: {formatTimeLeft(timeLeft)}</p>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </>
      )}
    </main>
  );
}

export default withAuth(Preparing);
