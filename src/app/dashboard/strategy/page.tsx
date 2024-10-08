'use client';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectivePage from './objective/page';  // Adjust the import paths
import StrategyCreationPage from './strategycreation/page'
import StrategyResultPage from './strategyresult/page';

function Strategy() {
  return (
    <Router>
      <div className="Strategy">
        <Routes>
          <Route path="/dashboard/strategy" element={<ObjectivePage />} />  {/* New route */}
          <Route path="/strategy-creation" element={<StrategyCreationPage />} />
          <Route path="/strategy-result" element={<StrategyResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default Strategy;