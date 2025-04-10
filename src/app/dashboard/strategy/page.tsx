'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectivePage from '@/components/dashboard/strategy-creation/setup01';
import StrategyCreationPage from '@/components/dashboard/strategy-creation/setup02';
import StrategyResultPage from '@/components/dashboard/strategy-creation/setup03';
import { createClient } from '../../../../utils/supabase/client'; // Adjust the import path as necessary
import './page.css'; // Import the CSS file for styles
import {Box, Typography, Button} from '@mui/material';
import { SketchLogo as DiamondIcon } from '@phosphor-icons/react/dist/ssr/SketchLogo';

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
          <Box className="cta-container">
            <Box className="leftC" sx={{display:'flex', flexDirection: 'column'}}>
            <Box className="header"><Box sx={{borderRadius:'50%', padding:'0.3rem', bgcolor:'#F1E400'}}><DiamondIcon></DiamondIcon></Box>
            Unlock Full Access</Box>
            <Box className="description">
              <p>
                Subscribe now to access premium tools and strategy insights that will help you elevate your skills and make smarter decisions.
                By subscribing, you will gain access to:
              </p>
              <ul>
                <li>Exclusive Tools designed to enhance your workflow and maximize productivity.</li>
                <li>Comprehensive Strategy Insights that offer actionable advice, data-driven recommendations, and best practices.</li>
                <li>Early Access to new features, updates, and content to stay ahead of the curve.</li>
                <li>Community Engagement with like-minded individuals, sharing knowledge, tips, and experiences to help each other succeed.</li>
              </ul>
              <p>
                This is your chance to get ahead—transform your approach and unlock your full potential with premium features you won’t find anywhere else!
              </p>
            </Box>

            <Box sx={{ display: 'flex', padding: '2rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f1f1', }}>
                <button className="cta-button">Subscribe Now</button></Box>
            </Box> {/*Left Column*/}
            <Box className="rightC"> {/*Right Column*/}
            <img src="/assets/ads-strategies.svg" alt="Unlock Access" className="cta-image" />
            </Box>
          </Box>
          <button className="close-btn">X</button>
        </div>
      )}
    </div>
  );
}

export default App;