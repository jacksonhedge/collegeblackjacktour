// Error context utility for sharing error information with AI chat
class ErrorContext {
  constructor() {
    this.recentError = null;
    this.errorHistory = [];
    this.maxHistorySize = 10;
  }

  // Record an error
  recordError(error, errorInfo = {}, context = {}) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.toString(),
      stack: error.stack,
      errorInfo,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    this.recentError = errorRecord;
    this.errorHistory.unshift(errorRecord);

    // Keep history size limited
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }

    // Store in sessionStorage for persistence
    try {
      sessionStorage.setItem('ai_chat_recent_error', JSON.stringify(errorRecord));
      sessionStorage.setItem('ai_chat_error_history', JSON.stringify(this.errorHistory));
    } catch (e) {
      console.error('Failed to store error in session storage:', e);
    }

    return errorRecord;
  }

  // Get the most recent error
  getRecentError() {
    if (this.recentError) {
      return this.recentError;
    }

    // Try to load from session storage
    try {
      const stored = sessionStorage.getItem('ai_chat_recent_error');
      if (stored) {
        this.recentError = JSON.parse(stored);
        return this.recentError;
      }
    } catch (e) {
      console.error('Failed to load error from session storage:', e);
    }

    return null;
  }

  // Get error history
  getErrorHistory() {
    if (this.errorHistory.length > 0) {
      return this.errorHistory;
    }

    // Try to load from session storage
    try {
      const stored = sessionStorage.getItem('ai_chat_error_history');
      if (stored) {
        this.errorHistory = JSON.parse(stored);
        return this.errorHistory;
      }
    } catch (e) {
      console.error('Failed to load error history from session storage:', e);
    }

    return [];
  }

  // Clear error context
  clearErrors() {
    this.recentError = null;
    this.errorHistory = [];
    
    try {
      sessionStorage.removeItem('ai_chat_recent_error');
      sessionStorage.removeItem('ai_chat_error_history');
    } catch (e) {
      console.error('Failed to clear error storage:', e);
    }
  }

  // Format error for AI context
  formatForAI() {
    const recent = this.getRecentError();
    if (!recent) return null;

    return {
      error: recent.message,
      timestamp: recent.timestamp,
      page: recent.context.url,
      stackTrace: recent.stack ? recent.stack.split('\n').slice(0, 5).join('\n') : 'No stack trace available'
    };
  }
}

export const errorContext = new ErrorContext();