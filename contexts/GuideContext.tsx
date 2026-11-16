'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface GuideContextType {
  showGuide: boolean;
  toggleGuide: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: ReactNode }) {
  const [showGuide, setShowGuide] = useState(true);

  const toggleGuide = () => {
    setShowGuide(prev => !prev);
  };

  return (
    <GuideContext.Provider value={{ showGuide, toggleGuide }}>
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
}
