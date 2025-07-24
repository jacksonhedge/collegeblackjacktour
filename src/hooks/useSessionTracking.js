import { useEffect } from 'react';
import { analyticsService } from '../services/firebase/AnalyticsService';

const useSessionTracking = (userId) => {
  useEffect(() => {
    if (!userId) return;

    const sessionStartTime = new Date();
    analyticsService.startSession(userId);

    const calculateSessionDuration = () => {
      const sessionEndTime = new Date();
      return Math.floor((sessionEndTime - sessionStartTime) / 1000); // Duration in seconds
    };

    const handleEndSession = () => {
      const duration = calculateSessionDuration();
      analyticsService.endSession(userId, duration);
    };

    // Add event listeners for various ways the session might end
    window.addEventListener('beforeunload', handleEndSession);
    window.addEventListener('pagehide', handleEndSession);

    return () => {
      // Clean up event listeners and end session when component unmounts
      window.removeEventListener('beforeunload', handleEndSession);
      window.removeEventListener('pagehide', handleEndSession);
      handleEndSession();
    };
  }, [userId]);
};

export default useSessionTracking;
