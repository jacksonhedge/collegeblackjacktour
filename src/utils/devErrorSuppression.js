// Development error suppression
export const initDevErrorSuppression = () => {
  if (!import.meta.env.DEV) return;

  // List of errors to suppress in development
  const suppressedPatterns = [
    'mce-autosize-textarea',
    'custom element with name',
    'already been defined',
    'webcomponents-ce.js',
    'overlay_bundle.js',
    'chrome-extension://',
    'Profile fetch timeout',
    'requires an index',
    'Failed to fetch dynamically imported module',
    'supabase.co/rest/v1/profiles',
    'Error getting referral code'
  ];

  // Override console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = function(...args) {
    const message = args.join(' ');
    const shouldSuppress = suppressedPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    if (!shouldSuppress) {
      originalConsoleError.apply(console, args);
    }
  };

  console.warn = function(...args) {
    const message = args.join(' ');
    
    // Keep Firebase index warnings but make them less prominent
    if (message.includes('Index not available')) {
      console.log('%c' + message, 'color: #888; font-size: 0.9em');
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };

  // Also set up a global flag to check if we're suppressing errors
  window.__DEV_ERROR_SUPPRESSION__ = true;
};