// AdAccountSelector.tsx
import React, { useEffect, useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useAdAccount } from './AdAccountContext';
import axios from 'axios';

const AdAccountSelector = () => {
  const { selectedAdAccount, setSelectedAdAccount } = useAdAccount();
  const [adAccounts, setAdAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdAccounts = async () => {
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

        console.log('Ad Accounts Response:', response.data);
        setAdAccounts(response.data.data);
      } catch (error) {
        console.error('Error fetching ad accounts:', error);
      }
    };

    fetchAdAccounts();
  }, []);

  return (
    <FormControl fullWidth>
      <InputLabel id="ad-account-select-label">Select Ad Account</InputLabel>
      <Select
        labelId="ad-account-select-label"
        value={selectedAdAccount}
        onChange={(e) => setSelectedAdAccount(e.target.value as string)}
        label="Select Ad Account"
      >
        <MenuItem value="">
          <em>Select Ad Account</em>
        </MenuItem>
        {adAccounts.map((account) => (
          <MenuItem key={account.id} value={account.id}>
            {account.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AdAccountSelector;
