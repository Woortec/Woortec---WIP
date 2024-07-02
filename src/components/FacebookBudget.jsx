import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FacebookBudget = () => {
  const [budget, setBudget] = useState(null);
  const [trend, setTrend] = useState('up'); // Placeholder for trend
  const [diff, setDiff] = useState(0); // Placeholder for diff

  useEffect(() => {
    const fetchBudget = async () => {
      const accessToken = localStorage.getItem('fbAccessToken');
      const userID = localStorage.getItem('fbUserID');

      if (!accessToken || !userID) {
        console.error('No access token or user ID found in local storage');
        return;
      }

      try {
        const response = await axios.get(`https://graph.facebook.com/v19.0/${userID}/adaccounts`, {
          params: {
            access_token: accessToken,
          },
        });

        const adAccountID = response.data.data[0].id;

        const budgetResponse = await axios.get(`https://graph.facebook.com/v19.0/${adAccountID}/insights`, {
          params: {
            access_token: accessToken,
            fields: 'spend',
            date_preset: 'last_30d',
          },
        });

        const spendData = budgetResponse.data.data[0].spend;
        setBudget(`$${spendData}`);
        // Set diff and trend based on actual data (Placeholder logic here)
        setDiff(10); // Placeholder for percentage difference
        setTrend('up'); // Placeholder for trend
      } catch (error) {
        console.error('Error fetching budget data', error);
      }
    };

    fetchBudget();
  }, []);

  if (!budget) {
    return <div>Loading...</div>;
  }

  return (
    <Budget
      diff={diff}
      trend={trend}
      sx={{ height: '100%' }}
      value={budget}
    />
  );
};

export default FacebookBudget;
