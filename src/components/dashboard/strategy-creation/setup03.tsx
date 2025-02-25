'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use Next.js's router
import styles from './styles/StrategyResultPage.module.css';
import TableCellBox from './TableCellBox';
import { Typography, Box, Paper } from '@mui/material';
import axios from 'axios';
import { createClient } from '../../../../utils/supabase/client'; // Supabase client

interface WeeklyPlan {
    weekNumber: string;
    startingDay: string;
    plansWeek: string;
    investPercentage: number;
    investAmount: number;
    numberOfAds: number;
    dailyBudgetPerAd: number;
    calculatedIncrease: number;
    toMessages: number;
    toLink: number;
}

// Function to save the JSON data to Supabase
const savePlanToSupabase = async (planOutput: WeeklyPlan[], userId: string) => {
    try {
        const supabase = createClient();

        // Insert the strategy result into the database
        const { data, error } = await supabase
            .from('facebook_campaign_data') // Make sure this table exists in your Supabase
            .insert([
                {
                    user_id: userId,
                    strategy_data: planOutput, // Storing the JSON data
                    created_at: new Date().toISOString(), // Timestamp for when it's saved
                },
            ]);

        if (error) {
            console.error('Error saving strategy data to Supabase:', error);
        } else {
            console.log('Strategy data successfully saved:', data);
        }
    } catch (error) {
        console.error('Unexpected error while saving to Supabase:', error);
    }
};

// Function to calculate the week number for a given date
function getWeekNumber(date: Date): string {
    const start = new Date(date.getFullYear(), 0, 1); // First day of the year
    const diff =
        (date.getTime() -
            start.getTime() +
            (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000) /
        86400000;
    return 'W' + Math.ceil((diff + ((start.getDay() + 1) % 7)) / 7); // Calculate week number
}

// Function to get the conversion rate to USD using the ExchangeRate API
async function getConversionRateToUSD(currency: string): Promise<number> {
    const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY; // Ensure this is set in your environment
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${currency}/USD`;

    try {
        const response = await axios.get(url);
        const conversionRate = response.data.conversion_rate;
        console.log(`Conversion rate from ${currency} to USD is ${conversionRate}`);
        return conversionRate;
    } catch (error) {
        console.error('Error fetching conversion rate:', error);
        return 1; // Fallback to 1 if USD
    }
}

// Custom rounding function
function customRound(num: number): number {
    const decimalPart = num - Math.floor(num);
    if (decimalPart < 0.5) {
        return Math.floor(num);
    } else {
        return Math.ceil(num);
    }
}

// Function to calculate the number of ads based on the investment amount in USD
function calculateNumAds(investAmountInUSD: number): number {
    let numAds;
    if (investAmountInUSD < 100) {
        numAds = investAmountInUSD / 3;
    } else if (investAmountInUSD <= 400) {
        numAds = investAmountInUSD / 6;
    } else {
        numAds = investAmountInUSD / 8;
    }
    numAds = numAds / 7;
    return customRound(numAds);
}

// Function to calculate the distribution between messages and link ads
function calculateToMessagesAndLinks(
    numberOfAds: number,
    answerMessages: string
): { toMessages: number; toLink: number } {
    let toLink;
    if (answerMessages === 'YES') {
        if (numberOfAds > 8) {
            toLink = Math.max(0, numberOfAds - 2);
        } else {
            toLink = Math.max(0, numberOfAds - 1);
        }
    } else {
        toLink = numberOfAds;
    }
    const toMessages = numberOfAds - toLink;
    return { toMessages, toLink };
}

// Function to get the next upcoming Monday
function getNextMonday(date: Date): Date {
    const resultDate = new Date(date);
    const day = resultDate.getDay(); // 0 (Sun) to 6 (Sat)
    const daysToAdd = (8 - day) % 7 || 7; // Calculate days to next Monday
    resultDate.setDate(resultDate.getDate() + daysToAdd);
    return resultDate;
}

// Function to calculate daily budget per ad
function calculateDailyBudgetPerAd(investAmountInUSD: number, numberOfAds: number): number {
    const dailyBudgetPerAd = investAmountInUSD / 7 / numberOfAds;
    return dailyBudgetPerAd;
}

// Function to calculate the weekly plan
async function calculatePlan(
    input: any,
    answerMessages: string,
    conversionRate: number,
    currency: string
): Promise<WeeklyPlan[]> {
    const Launchingpercentages = [0.06, 0.1, 0.1, 0.16, 0.16, 0.21, 0.21];
    const levels: WeeklyPlan[] = [];
    const startDate = getNextMonday(new Date(input.planRequestDate));

    // Convert amountToInvest to USD
    let amountToInvestInUSD = input.amountToInvest;
    if (currency !== 'USD') {
        amountToInvestInUSD = input.amountToInvest * conversionRate;
    }

    for (let i = 0; i < Launchingpercentages.length; i++) {
        const currentWeekDate = new Date(startDate);
        currentWeekDate.setDate(startDate.getDate() + i * 7); // Increment by weeks
        const weekNumber = getWeekNumber(currentWeekDate);
        const startingDay = currentWeekDate.toISOString().split('T')[0];
        const investPercentage = Launchingpercentages[i];
        let investAmountInUSD = amountToInvestInUSD * investPercentage;

        // Round up investAmountInUSD to two decimal places
        investAmountInUSD = Math.ceil(investAmountInUSD * 100) / 100;

        // Calculate the number of ads using the USD amount
        const numberOfAds = Number(calculateNumAds(investAmountInUSD));

        // Use the "To Messages" and "To Link" calculation logic
        const { toMessages, toLink } = calculateToMessagesAndLinks(numberOfAds, answerMessages);

        // Calculate daily budget per ad using the formula provided
        const dailyBudgetPerAdInUSD = calculateDailyBudgetPerAd(
            investAmountInUSD,
            numberOfAds
        );

        // Convert amounts back to the user's currency for display
        let investAmount = investAmountInUSD;
        let dailyBudgetPerAd = dailyBudgetPerAdInUSD;

        if (currency !== 'USD') {
            investAmount = investAmountInUSD / conversionRate;
            dailyBudgetPerAd = dailyBudgetPerAdInUSD / conversionRate;
        }

        // Round up investAmount and dailyBudgetPerAd to two decimal places
        investAmount = Math.ceil(investAmount * 100) / 100;
        dailyBudgetPerAd = Math.ceil(dailyBudgetPerAd * 100) / 100;

        // Apply the minimum daily budget per ad after conversion
        if (dailyBudgetPerAd < 1) {
            dailyBudgetPerAd = 1;
        }

        levels.push({
            weekNumber,
            startingDay,
            plansWeek: `W${i + 1}`,
            investPercentage,
            investAmount: +investAmount.toFixed(2),
            numberOfAds: numberOfAds,
            dailyBudgetPerAd: +dailyBudgetPerAd.toFixed(2),
            calculatedIncrease: 0,
            toMessages: toMessages,
            toLink: toLink,
        });
    }

    return levels;
}

// React component to display the strategy result
const StrategyResultPage: React.FC = () => {
    const router = useRouter(); // Initialize Next.js router
    const [campaignDetails, setCampaignDetails] = useState<any[]>([]);
    const [planOutput, setPlanOutput] = useState<WeeklyPlan[]>([]);
    const [currency, setCurrency] = useState<string>('USD'); // Default currency
    const [conversionRate, setConversionRate] = useState<number>(1); // Default conversion rate
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch campaign details from Supabase
    const fetchCampaignDetails = async () => {
        try {
            const supabase = createClient();
            const user_id = localStorage.getItem('userid'); // Retrieve user_id from localStorage

            if (!user_id) {
                console.error('User ID not found in localStorage');
                return;
            }

            // Fetch the currency from the `facebookData` table in Supabase
            const { data: facebookData, error: facebookError } = await supabase
                .from('facebookData')
                .select('currency')
                .eq('user_id', user_id)
                .single();

            if (facebookError) {
                console.error('Error fetching currency from facebookData:', facebookError);
            } else {
                setCurrency(facebookData?.currency || 'USD');
            }

            // Fetch the conversion rate for the user's currency
            const fetchedConversionRate = await getConversionRateToUSD(
                facebookData?.currency || 'USD'
            );
            setConversionRate(fetchedConversionRate);

            // Fetch the campaign details from Supabase
            const { data: strategyData, error: strategyError } = await supabase
                .from('ads_strategy')
                .select('*, manage_inquiries')
                .eq('user_id', user_id);

            if (strategyError) {
                console.error('Error fetching campaign details from Supabase:', strategyError);
            } else {
                setCampaignDetails(strategyData);

                if (strategyData && strategyData.length > 0) {
                    const firstCampaign = strategyData[0];
                    const planInput = {
                        planRequestDate: firstCampaign.created_at,
                        amountToInvest: parseFloat(firstCampaign.budget),
                    };

                    // Normalize `manage_inquiries` to lowercase and compare
                    const answerMessages =
                        firstCampaign.manage_inquiries &&
                        firstCampaign.manage_inquiries.toLowerCase() === 'yes'
                            ? 'YES'
                            : 'NO';

                    // Calculate the plan using the data fetched from Supabase
                    const calculatedPlan = await calculatePlan(
                        planInput,
                        answerMessages,
                        fetchedConversionRate,
                        facebookData?.currency || 'USD'
                    );
                    setPlanOutput(calculatedPlan);
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaignDetails(); // Fetch campaign details when component mounts
    }, []);
    
    // Add this new useEffect to save the planOutput once it is set
    useEffect(() => {
        const saveData = async () => {
            if (planOutput.length > 0) {
                const userId = localStorage.getItem('userid');
                if (userId) {
                    await savePlanToSupabase(planOutput, userId); // Call to save data in Supabase
                } else {
                    console.error('User ID not found.');
                }
            }
        };

        saveData();
    }, [planOutput]); // Triggered once the planOutput is ready
    if (loading) {
        return <div>Loading...</div>; // Loading state
    }

    if (campaignDetails.length === 0) {
        return <div>No campaign data available.</div>; // Show if there's no data
    }

    const handleBackToStart = () => {
        router.push('/dashboard/strategy'); // Navigate back to the strategy page
    };

    return (
        <div className={styles.container}>
            <div className={styles.headContainer}>
                <h2>Personalized Strategy</h2>
                <label>4 Levels</label>
            </div>

            <div className={styles.secondheadContainer}>
                <div className={styles.firstsecHeader}>Analysis</div>
                <div className={styles.secondsecHeader}>Performance Analysis</div>
            </div>

            <Paper className={styles.tableContainer}>
                <div className={styles.table}>
                    <TableCellBox className={styles.metaAds}>META ADS</TableCellBox>

                    {/*For level headers*/}
                    {planOutput.map((level, index) => {
                    const levelNumber = 
                        index === 0 ? 1 :  // W1 → Level 1
                        index <= 2 ? 2 :   // W2, W3 → Level 2
                        3;                 // W4, W5, W6, W7 → Level 3

                    // Avoid duplicate Level 2 header (render only for W2)
                    if (levelNumber === 2 && index > 1) return null; 

                    // Avoid duplicate Level 3 header (render only for W4)
                    if (levelNumber === 3 && index > 3) return null;

                    return (
                        <TableCellBox 
                        key={index} 
                        className={`${styles.levelHeader} ${styles[`levelHeader${levelNumber}`]}`}
                        colSpan={levelNumber === 2 ? 2 : levelNumber === 3 ? 4 : 1} // Apply colSpan to Level 2 and Level 3
                        >
                        LEVEL {levelNumber.toString().padStart(2, '0')}
                        </TableCellBox>
                    );
                    })}

                    <TableCellBox className={styles.tableCellBox}>Starting Day</TableCellBox>
                    {planOutput.map((level, index) => (
                        <TableCellBox key={index} className={styles.startingDay}>
                            {level.startingDay}
                        </TableCellBox>
                    ))}
                    <TableCellBox className={styles.tableCellBox}>Week Plans</TableCellBox>
                    {planOutput.map((level, index) => (
                        <TableCellBox key={index} className={styles.planWeek}>
                            {level.plansWeek}
                        </TableCellBox>
                    ))}
                    <TableCellBox className={styles.tableCellBox}>Invest Amount ({currency})</TableCellBox>
                    {planOutput.map((level, index) => (
                        <TableCellBox key={index} className={styles.invest}>
                            {level.investAmount.toFixed(2)} {currency}
                        </TableCellBox>
                    ))}
                    <TableCellBox className={styles.tableCellBox}>Number of Ads</TableCellBox>
                    {planOutput.map((level, index) => (
                        <TableCellBox key={index} className={styles.numAds}>
                            {level.numberOfAds}
                        </TableCellBox>
                    ))}
                    <TableCellBox className={styles.tableCellBox}>To Messages</TableCellBox>
                    {planOutput.map((level, index) => (
                        <TableCellBox key={index} className={styles.toMessages}>
                            {level.toMessages}
                        </TableCellBox>
                    ))}
                    <TableCellBox className={styles.tableCellBox}>To Link</TableCellBox>
                    {planOutput.map((level, index) => (
                        <TableCellBox key={index} className={styles.toLink}>
                            {level.toLink}
                        </TableCellBox>
                    ))}
                    <TableCellBox className={styles.tableCellBox}>Daily Budget / Ad ({currency})</TableCellBox>
                    {planOutput.map((level, index) => (
                        <TableCellBox key={index} className={styles.dailyBudget}>
                            {level.dailyBudgetPerAd.toFixed(2)} {currency}
                        </TableCellBox>
                    ))}
                </div>
            </Paper>

            <button className={styles.continueButton} onClick={handleBackToStart}>
                Start Over
            </button>
        </div>
    );
};

export default StrategyResultPage;
