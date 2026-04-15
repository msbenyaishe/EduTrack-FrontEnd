import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import AppI18nEffects from './components/AppI18nEffects';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppI18nEffects />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
