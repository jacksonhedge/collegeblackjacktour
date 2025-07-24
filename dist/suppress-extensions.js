// Suppress browser extension errors
(function() {
  // Override console.error to filter out extension errors
  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args.join(' ');
    
    // Skip extension-related errors
    if (errorString.includes('mce-autosize-textarea') ||
        errorString.includes('custom element with name') ||
        errorString.includes('already been defined') ||
        errorString.includes('webcomponents-ce.js') ||
        errorString.includes('overlay_bundle.js') ||
        errorString.includes('chrome-extension://')) {
      return;
    }
    
    // Call original console.error for other errors
    originalError.apply(console, args);
  };

  // Prevent custom element redefinition
  const originalDefine = window.customElements?.define;
  if (originalDefine) {
    window.customElements.define = function(name, constructor, options) {
      try {
        if (!customElements.get(name)) {
          originalDefine.call(customElements, name, constructor, options);
        }
      } catch (e) {
        // Silently ignore custom element errors
      }
    };
  }

  // Global error handler
  window.addEventListener('error', function(e) {
    if (e.message && (
        e.message.includes('mce-autosize-textarea') ||
        e.message.includes('custom element') ||
        e.message.includes('already been defined'))) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);

  // Unhandled rejection handler
  window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && e.reason.message && (
        e.reason.message.includes('mce-autosize-textarea') ||
        e.reason.message.includes('custom element'))) {
      e.preventDefault();
      return false;
    }
  });
})();