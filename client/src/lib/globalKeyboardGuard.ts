
// Global keyboard guard utility to prevent developer tools access
// This file creates a self-executing function that runs immediately when loaded

(function() {
  // Function to prevent developer tools keyboard shortcuts
  function preventDevToolsShortcuts() {
    // Block shortcuts at the document level for maximum coverage
    document.addEventListener('keydown', function(e) {
      // Common developer tools shortcuts
      if (
        // Chrome, Firefox, Edge
        (e.ctrlKey && e.shiftKey && (
          e.keyCode === 73 || // I key - Inspector
          e.keyCode === 74 || // J key - Console
          e.keyCode === 67 || // C key - Elements inspector
          e.keyCode === 75 || // K key - Network panel
          e.keyCode === 77    // M key - General dev tools
        )) ||
        // F12 key
        e.keyCode === 123 ||
        // Safari
        ((e.metaKey || e.ctrlKey) && e.altKey && e.keyCode === 73) ||
        // Additional Safari combinations
        ((e.metaKey || e.ctrlKey) && e.altKey && e.keyCode === 67)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true); // true uses capture phase to intercept early

    // Block right-click which might show "Inspect" option
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    }, true);
  }

  // Self-executing initialization
  function init() {
    preventDevToolsShortcuts();
    
    // Re-apply prevention every second to catch any dynamic page content
    setInterval(preventDevToolsShortcuts, 1000);
  }

  // Run immediately
  init();
})();

// Export empty object to make TypeScript happy when importing
export {};
