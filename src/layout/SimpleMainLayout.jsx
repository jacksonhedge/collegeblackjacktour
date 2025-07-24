import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import { GroupProvider } from '../contexts/GroupContext';
import ProtectedLayout from './ProtectedLayout';

// Simplified main layout without wallet-related providers
const SimpleMainLayout = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <GroupProvider>
      <ProtectedLayout>
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </ProtectedLayout>
    </GroupProvider>
  );
};

export default SimpleMainLayout;
