'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectivePage from '@/components/dashboard/strategy-creation/setup01';
import StrategyCreationPage from '@/components/dashboard/strategy-creation/setup02';
import StrategyResultPage from '@/components/dashboard/strategy-creation/setup03';
import { createClient } from '../../../../utils/supabase/client'; // Adjust the import path as necessary
import './page.css'; // Import the CSS file for styles

function App() {
  const [isClient, setIsClient] = useState(false);
  const [hasPlan, setHasPlan] = useState<boolean>(false); // State to track if user has planId
  const [loading, setLoading] = useState<boolean>(true); // Loading state while checking planId

  useEffect(() => {
    setIsClient(true);

    const checkUserPlan = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setHasPlan(false);
          setLoading(false);
          return;
        }

        if (session) {
          const user_id = session.user.id; // User's UUID
          const { data, error } = await supabase
            .from('user') // Adjust table name accordingly
            .select('planId')
            .eq('uuid', user_id) // Ensure correct column name
            .single();

          if (error) {
            console.error('Error fetching planId:', error);
            setHasPlan(false);
          } else {
            setHasPlan(!!data?.planId);
          }
        } else {
          console.error('No active session found');
          setHasPlan(false);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setHasPlan(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserPlan();
  }, []);

  if (!isClient || loading) {
    return null; // Render nothing on the server side or while loading
  }

  return (
    <div className="app-container">
      <div className={hasPlan ? '' : 'blurred-content'}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/dashboard/strategy" element={<ObjectivePage />} />
              <Route path="/dashboard/strategy/strategycreation" element={<StrategyCreationPage />} />
              <Route path="/dashboard/strategy/strategyresult" element={<StrategyResultPage />} />
            </Routes>
          </div>
        </Router>
      </div>
      {!hasPlan && (
        <div className="cta-overlay">
          <div className="cta-container">
            <img src="/assets/ads-strategies.svg" alt="Unlock Access" className="cta-image" />
            <h2>Unlock Full Access</h2>
            <p>Subscribe now to access premium tools and strategy insights.</p>
            <button className="cta-button">Upgrade Now</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;