import React, { createContext, useContext, useState } from 'react';

const MatchTypeContext = createContext();

export const MatchTypeProvider = ({ children }) => {
  const [activeSelection, setActiveSelection] = useState('Date'); // Default to Date

  return (
    <MatchTypeContext.Provider value={{ activeSelection, setActiveSelection }}>
      {children}
    </MatchTypeContext.Provider>
  );
};

export const useMatchType = () => useContext(MatchTypeContext);
