import React, { useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SupabaseAuthProvider from './contexts/SupabaseAuthContext';
import AdminAuthProvider from './contexts/AdminAuthContext';
import { SleeperProvider } from './contexts/SleeperContext';
import { WalletProvider } from './contexts/WalletContext';
import { GroupProvider } from './contexts/GroupContext';
import { LocationProvider } from './contexts/LocationContext';
import LocationAwarePlatformsProvider from './components/providers/LocationAwarePlatformsProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { PostHogProvider } from './contexts/PostHogContext';
import { TaskMasterProvider } from './contexts/TaskMasterContext';
import ProtectedLayout from './layout/ProtectedLayout';
import AdminRoute from './components/AdminRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SignUpFormSupabase from './components/auth/SignUpFormSupabase';
import LoginFormSupabase from './components/auth/LoginFormSupabase';
import SetupPINPage from './pages/SetupPINPage';
import BetaSignup from './pages/BetaSignup';
import LoadingScreen from './components/ui/LoadingScreen';
import ForceLogout from './pages/ForceLogout';
import ErrorBoundary from './components/ErrorBoundary';
import LocationDebugger from './components/location/LocationDebugger';
import AuthAwareApp from './components/AuthAwareApp';
import { notificationsService } from './services/firebase/NotificationsService';
import { auth } from './services/firebase/config';

// Lazy load non-critical components to improve initial load time
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminDashboardModern = lazy(() => import('./pages/AdminDashboardModern'));
const BankingView = lazy(() => import('./pages/BankingView'));
const MyLeagues = lazy(() => import('./pages/MyLeagues'));
const SendMoney = lazy(() => import('./pages/SendMoney'));
const Platforms = lazy(() => import('./pages/Platforms'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Partners = lazy(() => import('./pages/EnhancedPartners'));
const PartnersRouter = lazy(() => import('./pages/PartnersRouter'));
const Profile = lazy(() => import('./pages/Profile'));
const CreateGroup = lazy(() => import('./pages/CreateGroupEnhanced'));
const CreateGroupModal = lazy(() => import('./pages/CreateGroupModal'));
const GroupView = lazy(() => import('./pages/GroupView'));
const GroupUpgrade = lazy(() => import('./pages/GroupUpgrade'));
const GroupInvitePage = lazy(() => import('./pages/GroupInvitePage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const Groups = lazy(() => import('./pages/Groups'));
const TestEmails = lazy(() => import('./pages/TestEmails'));
const TestAuth = lazy(() => import('./pages/TestAuth'));
const JoinGroup = lazy(() => import('./pages/JoinGroup'));
const RewardsView = lazy(() => import('./pages/RewardsView'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const WalletsView = lazy(() => import('./pages/WalletsView'));
const GiftCardsView = lazy(() => import('./pages/GiftCardsView'));
const AdminTest = lazy(() => import('./pages/AdminTest'));
const FantasyHome = lazy(() => import('./pages/FantasyHome'));
const FantasyPlaque = lazy(() => import('./pages/FantasyPlaque'));
const EmailTest = lazy(() => import('./pages/EmailTest'));
const TaskMaster = lazy(() => import('./pages/TaskMaster'));
const DeveloperPortal = lazy(() => import('./pages/DeveloperPortal'));
const OAuthConsent = lazy(() => import('./pages/OAuthConsent'));
const NetworkExplorer = lazy(() => import('./pages/NetworkExplorer'));
const AdminNetwork = lazy(() => import('./pages/AdminNetwork'));
const Referrals = lazy(() => import('./pages/Referrals'));
const AdminTransactions = lazy(() => import('./pages/AdminTransactions'));
const AdminAPIStatus = lazy(() => import('./pages/AdminAPIStatus'));
const AdminLeagues = lazy(() => import('./pages/AdminLeagues'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TestPolygon = lazy(() => import('./pages/TestPolygon'));
const CommissionersCardDemo = lazy(() => import('./pages/CommissionersCardDemo'));

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // console.log('App component mounted');
    
    // Remove the initial HTML loader immediately
    if (window.removeInitialLoader) {
      window.removeInitialLoader();
    }
    
    // Don't use timeout - we'll wait for auth to be ready
    // This prevents the flash of login page
    // setAppLoading will be handled by auth state
    
    // Initialize service worker in the background after content is shown
    const initializeApp = async () => {
      // Wait a bit to ensure the UI has rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Register service worker
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
          // console.log('Service Worker registered');
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Run initialization in background
    initializeApp();
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Initialize push notifications when user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Skip pushing notifications in development mode
          if (import.meta.env.MODE === 'development') {
            // console.log('Skipping push notifications in development mode');
            return;
          }
          
          const token = await notificationsService.initializePushNotifications();
          if (token) {
            await notificationsService.saveNotificationPreferences(user.uid, {
              pushToken: token
            });
          }
        } catch (error) {
          console.error('Error initializing push notifications:', error);
          // Non-critical error, we can continue
        }
      }
    });

    // We've removed the hash-based routing handling here
    // All URLs are now clean without hash fragments

    return () => unsubscribe();
  }, []);

  // Loading spinner for lazy-loaded components
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white">Loading...</div>
    </div>
  );

  return (
    <ErrorBoundary>
      <LoadingScreen 
        isLoading={appLoading} 
        onLoadingComplete={() => {
          // console.log('Loading complete callback fired');
          setAppLoading(false);
        }}
      />
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
                    <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="signup" element={<SignUpFormSupabase />} />
                    <Route path="login" element={<LoginFormSupabase />} />
                    <Route path="setup-pin" element={<SetupPINPage />} />
                    <Route path="beta" element={<BetaSignup />} />
                    <Route path="logout" element={<ForceLogout />} />
                    
                    {/* Partners page - shows different content based on auth */}
                    <Route path="/partners" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <PartnersRouter />
                      </Suspense>
                    } />
                    
                    {/* Group invite routes - public so non-users can see */}
                    <Route path="/invite/:inviteCode" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <InvitePage />
                      </Suspense>
                    } />
                    <Route path="/invite/:groupId/:inviteCode" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <GroupInvitePage />
                      </Suspense>
                    } />
                    <Route path="/join/group/:groupId" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <GroupInvitePage />
                      </Suspense>
                    } />
                    
                    {/* Fantasy Network Explorer - public */}
                    <Route path="/network" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <NetworkExplorer />
                      </Suspense>
                    } />
                    
                    {/* Fantasy Plaque - public shopping page */}
                    <Route path="/fantasy-plaque" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <FantasyPlaque />
                      </Suspense>
                    } />

                    {/* Admin notifications routes */}
                    <Route path="admin" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminLogin />
                      </Suspense>
                    } />
                    <Route path="admin/notifications" element={
                      <AdminProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminNotifications />
                        </Suspense>
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Main admin dashboard route */}
                    <Route path="admin/dashboard" element={
                      <AdminProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminDashboardModern />
                        </Suspense>
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Admin network route */}
                    <Route path="admin/network" element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminNetwork />
                        </Suspense>
                      </AdminRoute>
                    } />
                    
                    {/* Admin transactions route */}
                    <Route path="admin/transactions" element={
                      <AdminProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminTransactions />
                        </Suspense>
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Admin API status route */}
                    <Route path="admin/api-status" element={
                      <AdminProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminAPIStatus />
                        </Suspense>
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Admin leagues route */}
                    <Route path="admin/leagues" element={
                      <AdminProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminLeagues />
                        </Suspense>
                      </AdminProtectedRoute>
                    } />

                    {/* Legacy admin routes - lazy loaded */}
                    <Route path="admin-panel" element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminPanel />
                        </Suspense>
                      </AdminRoute>
                    } />
                  <Route path="admin-test" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminTest />
                    </Suspense>
                  } />
                  <Route path="admin-direct" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminPanel />
                    </Suspense>
                  } />

                  {/* Protected routes - lazy loaded */}
                  <Route element={<ProtectedLayout />}>
                    <Route path="/wallet" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Wallet />
                      </Suspense>
                    } />
                    <Route path="/referrals" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Referrals />
                      </Suspense>
                    } />
                    <Route path="/banking" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <BankingView />
                      </Suspense>
                    } />
                    <Route path="/leagues" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <MyLeagues />
                      </Suspense>
                    } />
                    <Route path="/send" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <SendMoney />
                      </Suspense>
                    } />
                    <Route path="/spend" element={<Navigate to="/partner-platforms" replace />} />
                    <Route path="/pay" element={<Navigate to="/send" replace />} />
                    <Route path="/" element={<Navigate to="/wallet" replace />} />
                    <Route path="/platforms" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Platforms />
                      </Suspense>
                    } />
                    <Route path="/partner-platforms" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Partners />
                      </Suspense>
                    } />
                    <Route path="/wallets" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <WalletsView />
                      </Suspense>
                    } />
                    <Route path="/groups" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Groups />
                      </Suspense>
                    } />
                    <Route path="/groups/create" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <CreateGroupModal />
                      </Suspense>
                    } />
                    <Route path="/groups/join" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <JoinGroup />
                      </Suspense>
                    } />
                    <Route path="/rewards" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <RewardsView />
                      </Suspense>
                    } />
                    <Route path="/tasks" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <TaskMaster />
                      </Suspense>
                    } />
                    <Route path="/gift-cards" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <GiftCardsView />
                      </Suspense>
                    } />
                    <Route path="/profile" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Profile />
                      </Suspense>
                    } />
                    <Route path="/dashboard" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <DashboardPage />
                      </Suspense>
                    } />
                    <Route path="/fantasy-home" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <FantasyHome />
                      </Suspense>
                    } />
                    <Route path="/create-group" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <CreateGroup />
                      </Suspense>
                    } />
                    <Route path="/group/:id" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <GroupView />
                      </Suspense>
                    } />
                    <Route path="/groups/:groupId/upgrade" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <GroupUpgrade />
                      </Suspense>
                    } />
                    <Route path="/test-emails" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <TestEmails />
                      </Suspense>
                    } />
                    <Route path="/test-auth" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <TestAuth />
                      </Suspense>
                    } />
                    <Route path="/test-polygon" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <TestPolygon />
                      </Suspense>
                    } />
                    <Route path="/commissioners-card-demo" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <CommissionersCardDemo />
                      </Suspense>
                    } />
                    <Route path="/notifications" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <NotificationSettings />
                      </Suspense>
                    } />
                    <Route path="/email-test" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <EmailTest />
                      </Suspense>
                    } />
                    <Route path="/developers" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <DeveloperPortal />
                      </Suspense>
                    } />
                  </Route>
                  
                  {/* OAuth consent page (not protected) */}
                  <Route path="/oauth/consent" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <OAuthConsent />
                    </Suspense>
                  } />
                  
                  {/* Catch-all route to detect unmatched routes */}
                  <Route path="*" element={
                    <div className="p-8 text-center">
                      <h2 className="text-xl font-bold mb-4">Page not found</h2>
                      <p>The page you are looking for doesn't exist or has been moved.</p>
                      <p className="mt-4">Route: {window.location.pathname}</p>
                    </div>
                  } />
                </Routes>
                
                {/* Location Debugger - only shows in development or when needed */}
                <LocationDebugger />
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
}

export default App;
