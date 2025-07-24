import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';
import { WalletProvider } from '../contexts/WalletContext';
import { DwollaProvider } from '../contexts/DwollaContext';
import { SleeperProvider } from '../contexts/SleeperContext';
import { ESPNProvider } from '../contexts/ESPNContext';
import { YahooProvider } from '../contexts/YahooContext';
import { GroupProvider } from '../contexts/GroupContext';
import ProtectedLayout from './ProtectedLayout';

// Layout specifically for wallet-related views that need wallet providers
const WalletsLayout = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <WalletProvider>
      <DwollaProvider>
        <SleeperProvider>
          <ESPNProvider>
            <YahooProvider>
              <GroupProvider>
                <ProtectedLayout>
                  <Suspense fallback={<LoadingScreen />}>
                    {children}
                  </Suspense>
                </ProtectedLayout>
              </GroupProvider>
            </YahooProvider>
          </ESPNProvider>
        </SleeperProvider>
      </DwollaProvider>
    </WalletProvider>
  );
};

export default WalletsLayout;
