'use client'

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Analysis from '@/components/dashboard/strategies/analysis/analysis';
import Optimization from '@/components/dashboard/strategies/optimization/optimization';

const Strategies = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('analysis');

  const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStrategy(event.target.value);
  };

  return (
    <div className="App">
      <select value={selectedStrategy} onChange={handleSelectionChange}>
        <option value="analysis">Analysis</option>
        <option value="optimization">Optimization</option>
      </select>
      {selectedStrategy === 'analysis' && <Analysis />}
      {selectedStrategy === 'optimization' && <Optimization />}
    </div>
  );
};

export default Strategies;
