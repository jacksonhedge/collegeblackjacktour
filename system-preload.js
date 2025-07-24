// Polyfill for System.js module loading
(function() {
  if (!window.System) {
    window.System = {
      import: function(url) {
        return import(url);
      }
    };
  }
})();
