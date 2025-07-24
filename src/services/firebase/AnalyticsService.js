import { logEvent, setUserProperties } from 'firebase/analytics';
import { analytics } from './config';

class AnalyticsService {
  logEvent(eventName, eventParams = {}) {
    try {
      // Only log if analytics is available
      if (analytics) {
        logEvent(analytics, eventName, {
          ...eventParams,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      // Silently handle analytics errors in production
      if (import.meta.env.DEV) {
        console.warn(`Failed to log event ${eventName}:`, error);
      }
    }
  }

  // Click Tracking with User Information
  logClick(elementId, elementType, pageName, userInfo = null) {
    this.logEvent('user_click', {
      element_id: elementId,
      element_type: elementType,
      page_name: pageName,
      click_timestamp: new Date().toISOString(),
      // User information
      user_id: userInfo?.uid || 'anonymous',
      user_email: userInfo?.email || 'anonymous',
      user_display_name: userInfo?.displayName || 'anonymous'
    });
  }

  // Session Tracking
  startSession(userId) {
    this.logEvent('session_start', {
      user_id: userId,
      session_start_time: new Date().toISOString()
    });
    
    // Set user properties for the session
    if (analytics) {
      setUserProperties(analytics, {
        last_session_start: new Date().toISOString(),
        user_id: userId
      });
    }
  }

  endSession(userId, sessionDuration) {
    this.logEvent('session_end', {
      user_id: userId,
      session_end_time: new Date().toISOString(),
      session_duration: sessionDuration
    });
  }

  // Platform Events
  logPlatformView(platformId, platformName, category) {
    this.logEvent('platform_view', {
      platform_id: platformId,
      platform_name: platformName,
      category: category
    });
  }

  logPlatformVisit(platformId, platformName) {
    this.logEvent('platform_visit', {
      platform_id: platformId,
      platform_name: platformName
    });
  }

  logPlatformConnect(platformId, platformName) {
    this.logEvent('platform_connect', {
      platform_id: platformId,
      platform_name: platformName
    });
  }

  // Sleeper Events
  logSleeperConnect(username) {
    this.logEvent('sleeper_connect', {
      username: username
    });
  }

  logSleeperDisconnect() {
    this.logEvent('sleeper_disconnect');
  }

  logSleeperLeagueView(leagueId, leagueName) {
    this.logEvent('sleeper_league_view', {
      league_id: leagueId,
      league_name: leagueName
    });
  }

  // Navigation Events
  logPageView(pageName, pageTitle) {
    this.logEvent('page_view', {
      page_name: pageName,
      page_title: pageTitle,
      url: window.location.pathname
    });
  }

  // Notification Events
  logNotificationPermissionRequested() {
    this.logEvent('notification_permission_requested');
  }

  logNotificationPermissionGranted() {
    this.logEvent('notification_permission_granted');
  }

  logNotificationPermissionDenied() {
    this.logEvent('notification_permission_denied');
  }

  logNotificationSettingsUpdated(settings) {
    this.logEvent('notification_settings_updated', {
      email_enabled: settings.emailEnabled,
      push_enabled: settings.pushEnabled,
      categories: settings.categories
    });
  }
}

// Create a singleton instance
const analyticsService = new AnalyticsService();

// Export the singleton
export { analyticsService };
