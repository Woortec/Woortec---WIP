'use client'

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import '../../../../src/styles.css';

function CampaignSetup() {
  const [objective, setObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [adLink, setAdLink] = useState('');
  const [budget, setBudget] = useState('');
  const router = useRouter();

  useEffect(() => {
    const campaignDetails = localStorage.getItem('campaignDetails');
    const preparingStartTime = localStorage.getItem('preparingStartTime');

    if (campaignDetails && preparingStartTime) {
      router.push('/dashboard/adsstrategies/preparing');
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const campaignDetails = {
      objective,
      startDate,
      adLink,
      budget,
    };
    console.log(campaignDetails);
    // Save campaignDetails to localStorage or send to the server
    localStorage.setItem('campaignDetails', JSON.stringify(campaignDetails));
    localStorage.setItem('preparingStartTime', new Date().toString());
    router.push('/dashboard/adsstrategies/preparing');
  };

  return (
    <div className="container">
      <h1>Strategy Creation</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>What's your objective?</label>
          <input 
            type="text" 
            value={objective} 
            onChange={(e) => setObjective(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>When do you want to start?</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>What's the ad link?</label>
          <input 
            type="url" 
            value={adLink} 
            onChange={(e) => setAdLink(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>How much do you want to invest?</label>
          <input 
            type="number" 
            value={budget} 
            onChange={(e) => setBudget(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CampaignSetup;
