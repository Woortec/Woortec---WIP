// AdAccountContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AdAccountContextProps {
  selectedAdAccount: string;
  setSelectedAdAccount: (adAccount: string) => void;
}

const AdAccountContext = createContext<AdAccountContextProps | undefined>(undefined);

export const useAdAccount = () => {
  const context = useContext(AdAccountContext);
  if (!context) {
    throw new Error('useAdAccount must be used within an AdAccountProvider');
  }
  return context;
};

export const AdAccountProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>('');

  return (
    <AdAccountContext.Provider value={{ selectedAdAccount, setSelectedAdAccount }}>
      {children}
    </AdAccountContext.Provider>
  );
};
