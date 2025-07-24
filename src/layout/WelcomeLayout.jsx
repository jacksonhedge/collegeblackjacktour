import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import { PlatformsProvider } from '../contexts/PlatformsContext';

// Simplified layout for welcome flow - only includes essential providers
const WelcomeLayout = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PlatformsProvider>
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </PlatformsProvider>
  );
};

export default WelcomeLayout;
