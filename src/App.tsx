import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/SupabaseAuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { SleeperProvider } from './contexts/SleeperContext';
import { ESPNProvider } from './contexts/ESPNContext';
import { YahooProvider } from './contexts/YahooContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { GroupProvider } from './contexts/GroupContext';
import { DwollaProvider } from './contexts/DwollaContext';
import { PlatformsProvider } from './contexts/PlatformsContext';
import { Toaster } from 'react-hot-toast';
import ProtectedLayout from './layout/ProtectedLayout';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import SignUpStep2 from './components/auth/SignUpStep2';
import LandingPage from './pages/LandingPage';
import Unsubscribe from './pages/Unsubscribe';

// Lazy load protected routes
const WalletsView = lazy(() => import('./pages/WalletsView'));
const Profile = lazy(() => import('./pages/Profile'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const MyLeagues = lazy(() => import('./pages/MyLeagues'));
const SendMoney = lazy(() => import('./pages/SendMoney'));
const BankingView = lazy(() => import('./pages/BankingView'));
const FriendsView = lazy(() => import('./pages/FriendsView'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupView = lazy(() => import('./pages/GroupView'));
const CreateGroup = lazy(() => import('./pages/CreateGroupEnhanced'));
const JoinGroup = lazy(() => import('./pages/JoinGroup'));
const GroupInvitePage = lazy(() => import('./components/groups/GroupInvitePage'));
const Platforms = lazy(() => import('./pages/Platforms'));
const PaymentMethodsView = lazy(() => import('./pages/PaymentMethodsView'));
const GiftCardDemo = lazy(() => import('./pages/GiftCardDemo'));
const RewardsView = lazy(() => import('./pages/RewardsView'));
const AdminView = lazy(() => import('./pages/AdminView'));

interface RouteProps {
  children: React.ReactNode;
}

// Admin Route Component
const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      {children}
    </Suspense>
  );
};

// Simple Route Component - For pages that need auth but not the full layout
const SimpleRoute: React.FC<RouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-900" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <GroupProvider>
        {children}
      </GroupProvider>
    </Suspense>
  );
};

// Main App Layout Component - Wraps protected routes with necessary providers
const MainLayout: React.FC<RouteProps> = ({ children }) => {
  return (
    <WalletProvider>
      <DwollaProvider>
        <NotificationsProvider>
          <SleeperProvider>
            <ESPNProvider>
              <YahooProvider>
                <GroupProvider>
                  <ProtectedLayout>
                    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
                      {children}
                    </Suspense>
                  </ProtectedLayout>
                </GroupProvider>
              </YahooProvider>
            </ESPNProvider>
          </SleeperProvider>
        </NotificationsProvider>
      </DwollaProvider>
    </WalletProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <PlatformsProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/signup/step2" element={<SignUpStep2 />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              
              {/* Group Invite route - protected but with simple layout */}
              <Route 
                path="/invite/group/:groupId" 
                element={
                  <SimpleRoute>
                    <GroupInvitePage />
                  </SimpleRoute>
                } 
              />
              
              {/* Admin route */}
              <Route 
                path="/admin-dashboard-x7k9v2" 
                element={
                  <AdminRoute>
                    <AdminView />
                  </AdminRoute>
                } 
              />
              
              {/* Protected routes with main layout */}
              <Route path="/wallets" element={<MainLayout><WalletsView /></MainLayout>} />
              <Route path="/leagues" element={<MainLayout><MyLeagues /></MainLayout>} />
              <Route path="/friends" element={<MainLayout><FriendsView /></MainLayout>} />
              <Route path="/groups/create" element={<MainLayout><CreateGroup /></MainLayout>} />
              <Route path="/groups/join" element={<MainLayout><JoinGroup /></MainLayout>} />
              <Route path="/groups/:groupId" element={<MainLayout><GroupView /></MainLayout>} />
              <Route path="/groups" element={<MainLayout><Groups /></MainLayout>} />
              <Route path="/send" element={<MainLayout><SendMoney /></MainLayout>} />
              <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
              <Route path="/notifications" element={<MainLayout><NotificationSettings /></MainLayout>} />
              <Route path="/banking" element={<MainLayout><BankingView /></MainLayout>} />
              <Route path="/partners" element={<MainLayout><Platforms /></MainLayout>} />
              <Route path="/payment-methods" element={<MainLayout><PaymentMethodsView /></MainLayout>} />
              <Route path="/gift-card" element={<MainLayout><GiftCardDemo /></MainLayout>} />
              <Route path="/rewards" element={<MainLayout><RewardsView /></MainLayout>} />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </PlatformsProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
