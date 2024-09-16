// contexts/TourContext.tsx
'use client'
import React, { createContext, useState, useContext } from 'react';
import { Step } from 'react-joyride';

interface TourContextType {
  runTour: boolean;
  startTour: () => void;
  steps: Step[];
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [runTour, setRunTour] = useState<boolean>(false);

  // Define steps for both SideNav and Page.tsx
  const steps: Step[] = [
    // SideNav steps
    {
      target: '.overview-step',
      content: 'Here is the overview section.',
    },
    {
      target: '.ads-performance-step',
      content: 'Here you can view the ads performance.',
    },
    {
      target: '.ads-strategies-step',
      content: 'This section contains the ads strategies.',
    },
    {
      target: '.campaign-setup-step',
      content: 'Set up your campaign from here.',
    },
    {
      target: '.social-connections-step',
      content: 'Manage your social connections here.',
    },
    // Page.tsx steps
    {
      target: '.budget-container',
      content: 'This is where you can see your budget overview.',
    },
    {
      target: '.impressions-container',
      content: 'This shows the total impressions your ads have received.',
    },
    {
      target: '.cpm-container',
      content: 'This displays the cost per message for your ads.',
    },
    {
      target: '.profit-container',
      content: 'Here you can see the total ads running and their profit.',
    },
    {
      target: '.date-picker',
      content: 'Use this to select the date range for your data.',
    },
    {
      target: '.ad-spend-chart',
      content: 'This chart shows your ad spend over time.',
    },
    {
      target: '.total-reach',
      content: 'Check the total reach of your ads, including clicks and messages started.',
    },
  ];

  const startTour = () => {
    setRunTour(true);
  };

  return (
    <TourContext.Provider value={{ runTour, startTour, steps }}>
      {children}
    </TourContext.Provider>
  );
};
