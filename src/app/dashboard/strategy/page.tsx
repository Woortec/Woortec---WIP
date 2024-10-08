'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectivePage from '@/components/dashboard/strategy-creation/setup01';
import StrategyCreationPage from '@/components/dashboard/strategy-creation/setup02';
import StrategyResultPage from '@/components/dashboard/strategy-creation/setup03';

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
          <Route path="/dashboard/strategy" element={<ObjectivePage />} />
          <Route path="/dashboard/strategy/strategycreation" element={<StrategyCreationPage />} />
          <Route path="/dashboard/strategy/strategyresult" element={<StrategyResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
