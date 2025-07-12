export const getColor = (value: number, threshold: number, lowerIsBetter: boolean) => {
  return lowerIsBetter ? (value <= threshold ? 'lightgreen' : 'lightcoral') : (value >= threshold ? 'lightgreen' : 'lightcoral');
};

export const formatValue = (value: number, currency: string, isCurrency: boolean = true) => {
  // Debug logging
  console.log('formatValue called with:', { value, currency, isCurrency });
  
  if (value === null || value === undefined || isNaN(value)) {
    console.log('formatValue: Invalid value, returning 0');
    return isCurrency ? `0 ${currency}` : '0';
  }
  
  const result = isCurrency ? `${Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}` : value.toLocaleString();
  console.log('formatValue result:', result);
  return result;
};

export const getComment = (metric: string, value: number, threshold: number, lowerIsBetter: boolean) => {
  const aboveThreshold = lowerIsBetter ? value > threshold : value < threshold;

  switch (metric) {
    case 'CPC':
      return aboveThreshold
        ? 'Your CPC is higher than the average. Consider optimizing your ad content to reduce costs when updating your strategy.'
        : 'Great job! Your CPC is below the average, indicating efficient ad spend.';
    
    case 'CTR':
      return aboveThreshold
        ? 'Your CTR is higher than expected. Continue using engaging content to sustain this level of performance.'
        : 'Low CTR detected. Ensure your creatives are aligned to connect with your target audience.';
    
    case 'REACH':
      return aboveThreshold
        ? 'Your reach is performing well above the benchmark, ensuring your ads are seen by a wide audience.'
        : 'Your reach is below the expected level. Consider adjusting your budget or targeting for better results.';
    
    case 'SPENT':
      return aboveThreshold
        ? 'Your spending aligns with our recommendations, showing robust campaign funding.'
        : 'Your spending is lower than it should be for the selected time frame. Adjust your budget accordingly.';
    
    default:
      return '';
  }
};

export const getImpressionsComment = (impressions: number, expectedImpressions: number) => {
  return impressions >= expectedImpressions
    ? 'Your impressions are performing well above the benchmark, ensuring your ads are seen by a broad audience.'
    : 'Your impressions are below the expected level. Consider increasing your investment or refining your audience targeting.';
};

export const calculateSpentColor = (spend: number, expectedSpend: number) => {
  return spend >= expectedSpend ? 'lightgreen' : 'lightcoral';
};

export const calculateSpentComment = (spend: number, expectedSpend: number) => {
  return spend >= expectedSpend
    ? 'Your spending aligns with our recommendations, showing robust campaign funding.'
    : 'Your spending is less than advised. Adjust your budget for better results.';
};

const conversionRates: { [key: string]: number } = {
  USD: 1,
  PHP: 50,
  EUR: 0.85,
  GBP: 0.75
};

const thresholds = {
  ctr: 1.6, // New threshold for CTR
  cpc: 0.09, // CPC threshold
  impressions: 700, // Reach (impressions per $ invested)
  spend: 50 // Expected spend threshold
};

export const convertThresholds = (currency: string) => {
  const rate = conversionRates[currency] || 1;
  return {
    ctr: thresholds.ctr,
    cpc: thresholds.cpc * rate,
    impressions: thresholds.impressions,
    spend: thresholds.spend * rate
  };
};

export const calculateExpectedSpend = (budget: number, currency: string) => {
  return budget;
};
