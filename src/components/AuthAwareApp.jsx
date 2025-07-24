import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import LoadingScreen from './ui/LoadingScreen';

/**
 * AuthAwareApp component that coordinates loading states between auth and app
 * This prevents the flash of login page by ensuring auth is checked before showing content
 */
const AuthAwareApp = ({ children }) => {
  const { loading: authLoading, sessionChecked } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [minimumLoadTime, setMinimumLoadTime] = useState(false);

  useEffect(() => {
    // Ensure a minimum load time for better UX
    const timer = setTimeout(() => {
      setMinimumLoadTime(true);
    }, 800); // Minimum 800ms to prevent jarring transitions

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only show content when:
    // 1. Auth has checked for existing session
    // 2. Minimum load time has passed
    if (sessionChecked && minimumLoadTime) {
      setShowContent(true);
    }
  }, [sessionChecked, minimumLoadTime]);

  // Show loading screen while auth is initializing
  if (!showContent) {
    return <LoadingScreen />;
  }

  // Auth is ready, render the app
  return children;
};

export default AuthAwareApp;