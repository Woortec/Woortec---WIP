'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js's router
import styles from './styles/StrategyCreationPage.module.css';
import StepIndicator from './StepIndicator';
import { useLocale } from '@/contexts/LocaleContext';

const StrategyCreationPage: React.FC = () => {
    const [progress, setProgress] = useState(0); // State to track progress
    const [isClient, setIsClient] = useState(false); // State to check if the component is mounted client-side
    const router = isClient ? useRouter() : null; // Use router only on client-side
    const { t } = useLocale();

    useEffect(() => {
        // Ensure code only runs on the client side
        setIsClient(true);

        if (!isClient || !router) return;

        // Calculate total time (3 minutes = 180 seconds)
        const totalDuration = 1800; // 3 minutes in milliseconds
        const intervalDuration = totalDuration / 100; // Time for 1% progress

        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(timer); // Stop interval when progress reaches 100%
                    return 100;
                }
                return prevProgress + 1;
            });
        }, intervalDuration); // Increment progress based on interval duration

        // Navigate to the next page after 3 minutes (180000ms)
        const timeout = setTimeout(() => {
            router.push('/dashboard/strategy/strategyresult'); // Use router.push() to navigate
        }, totalDuration);

        return () => {
            clearInterval(timer); // Clear interval on component unmount
            clearTimeout(timeout); // Clear timeout on component unmount
        };
    }, [isClient, router]);

    if (!isClient) return null; // Render nothing until client-side

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('CampaignSetup.strategyCreationPage.title')}</h2>
            <p className={styles.description}>
                {t('CampaignSetup.strategyCreationPage.subtitle')}
            </p>
            <div className={styles.tabContainer}>
                <StepIndicator />
            </div>

            <div className={styles.loader}>
                <img src="/images/analyze.svg" alt="Creating strategy" className={styles.image} />
                <p className={styles.loadingText}>{t('CampaignSetup.strategyCreationPage.creatingStrategy')}</p>
                <div className={styles.progressBar}>
                    <div className={styles.progress} style={{ width: `${progress}%` }}></div>
                </div>
                <p className={styles.percentage}>{t('CampaignSetup.strategyCreationPage.percentComplete').replace('{progress}', progress.toString())}</p> {/* Display current progress */}
            </div>
        </div>
    );
};

export default StrategyCreationPage;
