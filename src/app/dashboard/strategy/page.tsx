'use client';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectivePage from './strategysetup/ObjectivePage';  // Adjust the import paths
import StrategyCreationPage from './strategysetup/ObjectivePage';
import StrategyResultPage from './strategysetup/ObjectivePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for Objective Page */}
          <Route path="/dashboard/strategy" element={<ObjectivePage />} />  {/* New route */}

          {/* Route for Strategy Creation Page */}
          <Route path="/strategy-creation" element={<StrategyCreationPage />} />

          {/* Route for Strategy Result Page */}
          <Route path="/strategy-result" element={<StrategyResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;