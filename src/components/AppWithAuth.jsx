import React, { useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SupabaseAuthProvider, { useAuth } from '../contexts/SupabaseAuthContext';
import AdminAuthProvider from '../contexts/AdminAuthContext';
import { SleeperProvider } from '../contexts/SleeperContext';
import { WalletProvider } from '../contexts/WalletContext';
import { GroupProvider } from '../contexts/GroupContext';
import { LocationProvider } from '../contexts/LocationContext';
import LocationAwarePlatformsProvider from './providers/LocationAwarePlatformsProvider';
import { ThemeProvider } from '../contexts/ThemeContext';
import { PostHogProvider } from '../contexts/PostHogContext';
import { TaskMasterProvider } from '../contexts/TaskMasterContext';
import ProtectedLayout from '../layout/ProtectedLayout';
import AdminRoute from './AdminRoute';
import AdminProtectedRoute from './AdminProtectedRoute';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import SignUpFormSupabase from './auth/SignUpFormSupabase';
import LoginFormSupabase from './auth/LoginFormSupabase';
import SetupPINPage from '../pages/SetupPINPage';
import BetaSignup from '../pages/BetaSignup';
import LoadingScreen from './ui/LoadingScreen';
import ForceLogout from '../pages/ForceLogout';
import ErrorBoundary from './ErrorBoundary';
import LocationDebugger from './location/LocationDebugger';
import { notificationsService } from '../services/firebase/NotificationsService';
import { auth } from '../services/firebase/config';

// Lazy load pages
const AdminPanel = lazy(() => import('./AdminPanel'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const AdminNotifications = lazy(() => import('../pages/AdminNotifications'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const BankingView = lazy(() => import('../pages/BankingView'));
const MyLeagues = lazy(() => import('../pages/MyLeagues'));
const SendMoney = lazy(() => import('../pages/SendMoney'));
const Platforms = lazy(() => import('../pages/Platforms'));
const Wallet = lazy(() => import('../pages/Wallet'));
const Partners = lazy(() => import('../pages/EnhancedPartners'));
const PartnersRouter = lazy(() => import('../pages/PartnersRouter'));
const Profile = lazy(() => import('../pages/Profile'));
const CreateGroup = lazy(() => import('../pages/CreateGroupEnhanced'));
const GroupView = lazy(() => import('../pages/GroupView'));
const Groups = lazy(() => import('../pages/Groups'));
const JoinGroup = lazy(() => import('../pages/JoinGroup'));
const WalletsView = lazy(() => import('../pages/WalletsView'));
const PaymentMethodsView = lazy(() => import('../pages/PaymentMethodsView'));
const GiftCardsView = lazy(() => import('../pages/GiftCardsView'));
const RewardsView = lazy(() => import('../pages/RewardsView'));
const Referrals = lazy(() => import('../pages/Referrals'));
const NetworkExplorer = lazy(() => import('../pages/NetworkExplorer'));
const FantasyHome = lazy(() => import('../pages/FantasyHome'));
const FantasyPlaque = lazy(() => import('../pages/FantasyPlaque'));
const TaskMaster = lazy(() => import('../pages/TaskMaster'));
const Unsubscribe = lazy(() => import('../pages/Unsubscribe'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      <p className="text-white mt-4">Loading...</p>
    </div>
  </div>
);

/**
 * Inner app component that has access to auth context
 */
const AppContent = () => {
  const { loading: authLoading, sessionChecked } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Remove initial HTML loader
    if (window.removeInitialLoader) {
      window.removeInitialLoader();
    }
  }, []);

  useEffect(() => {
    // App is ready when auth has checked session
    if (sessionChecked) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sessionChecked]);

  // Initialize services in background
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Register service worker
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    if (appReady) {
      initializeServices();
    }
  }, [appReady]);

  // Show loading screen until auth is ready
  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginFormSupabase />} />
      <Route path="/signup" element={<SignUpFormSupabase />} />
      <Route path="/beta" element={<BetaSignup />} />
      <Route path="/logout" element={<ForceLogout />} />
      
      {/* Partners page - shows different content based on auth */}
      <Route path="/partners" element={
        <Suspense fallback={<LoadingFallback />}>
          <PartnersRouter />
        </Suspense>
      } />
      
      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/wallet" element={
          <Suspense fallback={<LoadingFallback />}>
            <Wallet />
          </Suspense>
        } />
        <Route path="/banking" element={
          <Suspense fallback={<LoadingFallback />}>
            <BankingView />
          </Suspense>
        } />
        <Route path="/partner-platforms" element={
          <Suspense fallback={<LoadingFallback />}>
            <Partners />
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        } />
        <Route path="/groups" element={
          <Suspense fallback={<LoadingFallback />}>
            <Groups />
          </Suspense>
        } />
        <Route path="/rewards" element={
          <Suspense fallback={<LoadingFallback />}>
            <RewardsView />
          </Suspense>
        } />
        {/* Add other protected routes here */}
      </Route>
      
      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/login" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminLogin />
          </Suspense>
        } />
      </Route>
      
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminPanel />
          </Suspense>
        } />
        <Route path="/admin/notifications" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminNotifications />
          </Suspense>
        } />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Main App component with providers
 */
const AppWithAuth = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SupabaseAuthProvider>
          <Router>
            <PostHogProvider>
              <LocationProvider>
                <LocationAwarePlatformsProvider>
                  <SleeperProvider>
                    <WalletProvider>
                      <GroupProvider>
                        <TaskMasterProvider>
                          <AdminAuthProvider>
                            <AppContent />
                          </AdminAuthProvider>
                        </TaskMasterProvider>
                      </GroupProvider>
                    </WalletProvider>
                  </SleeperProvider>
                </LocationAwarePlatformsProvider>
              </LocationProvider>
            </PostHogProvider>
          </Router>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppWithAuth;