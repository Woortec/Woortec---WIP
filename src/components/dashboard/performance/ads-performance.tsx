'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

interface SpendData {
  date: string;
  spend: number;
}

interface ApiResponseItem {
  date_start: string;
  spend: string;
}

const setItemWithExpiry = (key: string, value: string, ttl: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getItemWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Failed to parse item from localStorage', error);
    localStorage.removeItem(key);
    return null;
  }
};

const AccountPerformance = () => {
  const [data, setData] = useState<SpendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getItemWithExpiry('fbAccessToken');
    const storedAdAccount = getItemWithExpiry('fbAdAccount');

    if (token && storedAdAccount) {
      fetchData(token, storedAdAccount);
    } else {
      console.error('Access token or ad account is missing');
    }
  }, []);

  const fetchData = async (token: string, adAccount: string): Promise<void> => {
    try {
      const response = await axios.get<{ data: ApiResponseItem[] }>(`https://graph.facebook.com/v19.0/${adAccount}/insights`, {
        params: {
          access_token: token,
          fields: 'spend,date_start,date_stop',
          time_range: JSON.stringify({ since: '2023-01-01', until: '2023-12-31' }),
        },
      });

      console.log('API Response:', response.data);

      const spendData: SpendData[] = response.data.data.map((item: ApiResponseItem) => ({
        date: item.date_start,
        spend: parseFloat(item.spend),
      }));

      console.log('Processed Data:', spendData);

      setData(spendData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <Card sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Amount Spent Per Day
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="spend" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default AccountPerformance;
