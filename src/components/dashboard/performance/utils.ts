export const getColor = (value: number, threshold: number, lowerIsBetter: boolean) => {
    return lowerIsBetter ? (value <= threshold ? 'lightgreen' : 'lightcoral') : (value >= threshold ? 'lightgreen' : 'lightcoral');
  };
  
  export const formatValue = (value: number, currency: string, isCurrency: boolean = true) => {
    return isCurrency ? `${Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}` : value.toLocaleString();
  };
  
  export const getComment = (metric: string, value: number, threshold: number, lowerIsBetter: boolean) => {
    const aboveThreshold = lowerIsBetter ? value > threshold : value < threshold;
    switch (metric) {
      case 'CPC':
        return aboveThreshold ? 'Your CPC is higher than the average. Consider optimizing your ad content to reduce costs.' :
          'Great job! Your CPC is below the average, indicating efficient ad spend.';
      case 'CPM':
        return aboveThreshold ? 'Your CPM is above the desired level. Try experimenting with different ad formats and refining your audience segmentation to boost performance.' :
          'Excellent! Your CPM is below the industry standard, showing good ad placement efficiency.';
      default:
        return '';
    }
  };
  
  export const getImpressionsComment = (impressions: number, expectedImpressions: number) => {
    return impressions >= expectedImpressions ? 
      'Your impressions are performing well above the benchmark, ensuring your ads are seen by a broad audience.' :
      'Your impressions are below the expected level. Increasing your investment or refining your audience targeting could help.';
  };
  
  export const calculateSpentColor = (spend: number, expectedSpend: number) => {
    return spend >= expectedSpend ? 'lightgreen' : 'lightcoral';
  };
  
  export const calculateSpentComment = (spend: number, expectedSpend: number) => {
    return spend >= expectedSpend ? 
      'Your spending aligns with our recommendations, showing robust campaign funding.' : 
      'Your spending is less than advised. Adjust your budget for better results.';
  };
  
  const conversionRates: { [key: string]: number } = {
    USD: 1,
    PHP: 50,
    EUR: 0.85,
    GBP: 0.75
  };
  
  const thresholds = {
    cpm: 0.99,
    cpc: 0.09,
    impressions: 19,
    spend: 50
  };
  
  export const convertThresholds = (currency: string) => {
    const rate = conversionRates[currency] || 1;
    return {
      cpm: thresholds.cpm * rate,
      cpc: thresholds.cpc * rate,
      impressions: thresholds.impressions,
      spend: thresholds.spend * rate
    };
  };
  
  export const calculateExpectedSpend = (budget: number, currency: string) => {
    return budget;
  };
  