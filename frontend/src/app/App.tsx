import React from 'react';
import { AppProvider } from '../providers';
import { AppRouter } from '../router';

/**
 * Root Application Component
 */
export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;
