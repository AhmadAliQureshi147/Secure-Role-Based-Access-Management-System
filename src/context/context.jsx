import React, { createContext, useContext, useState } from 'react';

const LocalContext = createContext();

export const useLocalContext = () => useContext(LocalContext);

export const ContextProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <LocalContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </LocalContext.Provider>
  );
};

export default LocalContext;
