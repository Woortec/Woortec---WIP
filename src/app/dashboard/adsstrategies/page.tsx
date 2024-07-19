'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CampaignSetup from '../../../components/dashboard/adsstrategies/adsstrategies';  // Adjust the import path as necessary
import Preparing from '../../../components/dashboard/adsstrategies/preparing';
import Results from '../../../components/dashboard/adsstrategies/results';

function App() {
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
          <Route path="/dashboard/adsstrategies" element={<CampaignSetup />} />
          <Route path="/dashboard/preparing" element={<Preparing />} />
          <Route path="/dashboard/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
