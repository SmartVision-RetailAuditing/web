import React from 'react';
import AppRouter from './app/routes/AppRouter';

function App() {
  return (
    // In the future, global state wrappers (providers) like AuthProvider and ThemeProvider will be added here.
    // For now, only rendering the router structure.
    <AppRouter />
  );
}

export default App;