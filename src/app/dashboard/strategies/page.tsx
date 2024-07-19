// src/app/dashboard/strategies/index.tsx

'use client';

import React, { useState } from 'react';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import Analysis from '@/components/dashboard/strategies/analysis/analysis';
import Optimization from '@/components/dashboard/strategies/optimization/optimization';
import ExpressLaunching from '@/components/dashboard/strategies/expresslaunching/expresslaunching';
import Launching from '@/components/dashboard/strategies/launching/launching';

const Strategies = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Strategies
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="strategies tabs">
          <Tab label="Analysis" />
          <Tab label="Optimization" />
          <Tab label="Launching" />
          <Tab label="Express Launching" />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2 }}>
        {selectedTab === 0 && <Analysis />}
        {selectedTab === 1 && <Optimization />}
        {selectedTab === 2 && <Launching />}
        {selectedTab === 3 && <ExpressLaunching />}
      </Box>
    </Container>
  );
};

export default Strategies;
