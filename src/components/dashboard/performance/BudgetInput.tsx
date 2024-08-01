import React from 'react';
import { TextField } from '@mui/material';
import styles from './styles/BudgetInput.module.css';

interface BudgetInputProps {
  budget: number;
  onBudgetChange: (newBudget: number) => void;
  currency: string;
}

const BudgetInput: React.FC<BudgetInputProps> = ({ budget, onBudgetChange, currency }) => {
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBudget = Number(e.target.value);
    onBudgetChange(newBudget);
  };

  return (
    <TextField
      label={`Monthly Budget (${currency})`}
      variant="outlined"
      type="number"
      value={budget}
      onChange={handleBudgetChange}
      className={styles.input}
    />
  );
};

export default BudgetInput;
