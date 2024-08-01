'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CampaignSetupPage from './index';
import PreparingPage from './preparing';
import LaunchingPage from './launching';
import AnalysisPage from './analysis';

function CampaignSetupRouting() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server side
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/dashboard/campaign" element={<CampaignSetupPage />} />
          <Route path="/dashboard/preparing" element={<PreparingPage />} />
          <Route path="/dashboard/launching" element={<LaunchingPage />} />
          <Route path="/dashboard/analysis" element={<AnalysisPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default CampaignSetupRouting;
