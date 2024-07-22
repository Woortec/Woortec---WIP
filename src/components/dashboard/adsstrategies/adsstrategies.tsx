'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import '../../../../src/styles.css';

function CampaignSetup() {
  const [objective, setObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [adLink, setAdLink] = useState('');
  const [budget, setBudget] = useState('');
  const [answerMessages, setAnswerMessages] = useState('');
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
      answerMessages,
    };
    console.log(campaignDetails);
    localStorage.setItem('campaignDetails', JSON.stringify(campaignDetails));
    localStorage.setItem('preparingStartTime', new Date().toString());
    router.push('/dashboard/adsstrategies/preparing');
  };

  return (
    <div className="container">
      <h1>Strategy Creation</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>What's your objective with this investment?</label>
          <select 
            value={objective} 
            onChange={(e) => setObjective(e.target.value)} 
            required
          >
            <option value="">Select an objective</option>
            <option value="Focus on engagement">Focus on engagement</option>
            <option value="Drive sales">Drive sales</option>
            <option value="Use a quick form to collect data from potential customers">
              Use a quick form to collect data from potential customers
            </option>
            <option value="Gather information from genuinely interested clients">
              Gather information from genuinely interested clients
            </option>
            <option value="Ensure you have a landing page">Ensure you have a landing page</option>
          </select>
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
          <label>How much do you want to invest? (in Euros)</label>
          <input 
            type="number" 
            value={budget} 
            onChange={(e) => setBudget(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Are you able to answer messages?</label>
          <select 
            value={answerMessages} 
            onChange={(e) => setAnswerMessages(e.target.value)} 
            required
          >
            <option value="">Select an answer</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CampaignSetup;
