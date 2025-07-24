import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { SleeperProvider } from './contexts/SleeperContext';
import ProtectedLayout from './layout/ProtectedLayout';
import LandingPage from './pages/LandingPage';
import SignUpForm from './components/auth/SignUpForm';
import LoginForm from './components/auth/LoginForm';
import BankingView from './pages/BankingView';
import MyLeagues from './pages/MyLeagues';
import SendMoney from './pages/SendMoney';
import Platforms from './pages/Platforms';
import Profile from './pages/Profile';
import CreateGroup from './pages/CreateGroup';
import GroupView from './pages/GroupView';
import NotificationSettings from './pages/NotificationSettings';
import { notificationsService } from './services/firebase/NotificationsService';
import { auth } from './services/firebase/config';

function App() {
  useEffect(() => {
    // Initialize push notifications when user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await notificationsService.initializePushNotifications();
          if (token) {
            await notificationsService.saveNotificationPreferences(user.uid, {
              pushToken: token
            });
          }
        } catch (error) {
          console.error('Error initializing push notifications:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <SleeperProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/login" element={<LoginForm />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/banking" element={<BankingView />} />
              <Route path="/leagues" element={<MyLeagues />} />
              <Route path="/send" element={<SendMoney />} />
              <Route path="/spend" element={<Platforms />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-group" element={<CreateGroup />} />
              <Route path="/group/:id" element={<GroupView />} />
              <Route path="/notifications" element={<NotificationSettings />} />
            </Route>
          </Routes>
        </Router>
      </SleeperProvider>
    </AuthProvider>
  );
}

export default App;
