import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/StrategyCreationPage.module.css';
import StepIndicator from './StepIndicator';

const StrategyCreationPage: React.FC = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0); // State to track progress

    useEffect(() => {
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
            navigate('/strategy-result');
        }, totalDuration);

        return () => {
            clearInterval(timer); // Clear interval on component unmount
            clearTimeout(timeout); // Clear timeout on component unmount
        };
    }, [navigate]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Strategy Creation</h2>
            <p className={styles.description}>
                Introducing woortec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With woortec, you can effortlessly create and manage ads across multiple social media platforms, all in one place.
            </p>
            <StepIndicator />
            <div className={styles.loader}>
                <img src="/path-to-your-image" alt="Creating strategy" className={styles.image} />
                <p className={styles.loadingText}>Creating your ads strategy...</p>
                <div className={styles.progressBar}>
                    <div className={styles.progress} style={{ width: `${progress}%` }}></div>
                </div>
                <p className={styles.percentage}>{progress}%</p> {/* Display current progress */}
            </div>
        </div>
    );
};

export default StrategyCreationPage;
