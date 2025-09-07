import React from 'react';
import { DashboardDataProvider } from '@/contexts/DashboardDataContext';
import AdsPerformance from '../../../components/dashboard/performance/AdsPerformance';

function App() {
  // Default params for ads performance (last 7 days)
  const defaultParams = {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    timeRange: 'thisWeek' as const
  };

  return (
    <div className="App">
      <DashboardDataProvider params={defaultParams}>
        <AdsPerformance />
      </DashboardDataProvider>
    </div>
  );
}

export default App;
