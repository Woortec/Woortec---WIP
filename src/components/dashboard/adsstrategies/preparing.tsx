'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '../../withAuth';
import '../../../../src/styles.css';

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
      const remainingTime = 60000 - diff; // 1 hour in milliseconds

      if (remainingTime <= 0) {
        localStorage.removeItem('preparingStartTime');
        router.push('/dashboard/adsstrategies/results');
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

  return (
    <div className="container">
      <h1>We are preparing your strategy</h1>
      <p>Please come back in an hour for the result.</p>
      {timeLeft !== null && <p className="timer">Time left: {formatTimeLeft(timeLeft)}</p>}
    </div>
  );
}

export default withAuth(Preparing);
