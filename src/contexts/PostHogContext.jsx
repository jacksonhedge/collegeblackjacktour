import React, { createContext, useContext, useEffect } from 'react';
import posthog from 'posthog-js';
import { useAuth } from './SupabaseAuthContext';
import { useLocation, useNavigationType } from 'react-router-dom';

// Create context
const PostHogContext = createContext(null);

// PostHog configuration
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_YOUR_PROJECT_API_KEY';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export const PostHogProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigationType = useNavigationType();

  // Initialize PostHog
  useEffect(() => {
    if (POSTHOG_KEY !== 'phc_YOUR_PROJECT_API_KEY') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Capture pageviews automatically
        capture_pageview: false, // We'll do this manually for better control
        // Capture clicks, form submissions automatically
        autocapture: true,
        // Session recording (optional - enable for detailed user sessions)
        session_recording: {
          enabled: true,
          recordCrossOriginIframes: false,
        },
        // Performance tracking
        capture_performance: true,
        // Disable in development
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            posthog.opt_out_capturing();
          }
        }
      });
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (POSTHOG_KEY !== 'phc_YOUR_PROJECT_API_KEY') {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: location.pathname,
        $navigation_type: navigationType
      });
    }
  }, [location, navigationType]);

  // Identify user when they log in
  useEffect(() => {
    if (POSTHOG_KEY !== 'phc_YOUR_PROJECT_API_KEY') {
      if (currentUser) {
        // Identify the user
        posthog.identify(currentUser.id, {
          email: currentUser.email,
          username: currentUser.user_metadata?.username,
          created_at: currentUser.created_at,
          phone_verified: currentUser.user_metadata?.phone_verified || false,
          provider: currentUser.app_metadata?.provider || 'email'
        });

        // Set user properties that persist across sessions
        posthog.people.set({
          email: currentUser.email,
          username: currentUser.user_metadata?.username,
          total_balance: currentUser.user_metadata?.bankroll || 0
        });
      } else {
        // User logged out
        posthog.reset();
      }
    }
  }, [currentUser]);

  // Custom event tracking functions
  const trackEvent = (eventName, properties = {}) => {
    if (POSTHOG_KEY !== 'phc_YOUR_PROJECT_API_KEY') {
      posthog.capture(eventName, properties);
    }
  };

  const trackFunnelStep = (funnelName, step, properties = {}) => {
    trackEvent(`funnel_${funnelName}_step_${step}`, {
      funnel_name: funnelName,
      funnel_step: step,
      ...properties
    });
  };

  const trackButtonClick = (buttonName, properties = {}) => {
    trackEvent('button_clicked', {
      button_name: buttonName,
      ...properties
    });
  };

  const trackFormSubmit = (formName, success, properties = {}) => {
    trackEvent('form_submitted', {
      form_name: formName,
      success,
      ...properties
    });
  };

  const trackFeatureUsage = (featureName, properties = {}) => {
    trackEvent('feature_used', {
      feature_name: featureName,
      ...properties
    });
  };

  const trackError = (errorMessage, errorType = 'general', properties = {}) => {
    trackEvent('error_occurred', {
      error_message: errorMessage,
      error_type: errorType,
      ...properties
    });
  };

  const value = {
    posthog,
    trackEvent,
    trackFunnelStep,
    trackButtonClick,
    trackFormSubmit,
    trackFeatureUsage,
    trackError
  };

  return (
    <PostHogContext.Provider value={value}>
      {children}
    </PostHogContext.Provider>
  );
};

// Custom hook to use PostHog
export const usePostHog = () => {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
};