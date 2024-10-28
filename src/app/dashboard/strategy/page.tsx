'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectivePage from '@/components/dashboard/strategy-creation/setup01';
import StrategyCreationPage from '@/components/dashboard/strategy-creation/setup02';
import StrategyResultPage from '@/components/dashboard/strategy-creation/setup03';
import { createClient } from '../../../../utils/supabase/client'; // Adjust the import path as necessary

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
          // Fetch the user's planId from the 'user' table
          const { data, error } = await supabase
            .from('user') // Use 'user' or 'users' depending on your table name
            .select('planId')
            .eq('uuid', user_id) // Use the correct column that stores the user's UUID
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
    <div style={{ position: 'relative' }}>
      <div style={{ filter: hasPlan ? 'none' : 'blur(5px)' }}>
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
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '20px',
              borderRadius: '8px',
              pointerEvents: 'auto',
              textAlign: 'center',
            }}
          >
            <p>You need to subscribe in order to use our services</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
