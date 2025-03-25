
/**
 * Global keyboard event handler to prevent developer tools access
 * Blocks all common shortcuts used to open developer tools
 */

const initializeGlobalKeyboardGuard = () => {
  // Self-executing initialization
  (function() {
    const YOUTUBE_REDIRECT_URL = 'https://www.youtube.com';
    
    const preventDevToolsShortcuts = () => {
      // Add event listeners at document and window level with capture
      [document, window].forEach(target => {
        target.addEventListener('keydown', function(e) {
          // Block all known DevTools shortcuts
          if (
            // Chrome, Edge, Firefox: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
            // All browsers: F12
            (e.key === 'F12') ||
            // Chrome, Edge: Ctrl+Alt+I
            (e.ctrlKey && e.altKey && (e.key === 'I' || e.key === 'i')) ||
            // Firefox: Shift+F7
            (e.shiftKey && e.key === 'F7') ||
            // Chrome context menu inspect: Alt+Shift+I
            (e.altKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
            // Safari: Cmd+Alt+I, Cmd+Alt+J, Cmd+Alt+C
            ((e.metaKey || e.key === 'Meta') && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
          ) {
            console.log("Blocked DevTools shortcut");
            e.stopPropagation();
            e.preventDefault();
            
            // For repeated attempts, redirect to YouTube
            const attempts = parseInt(localStorage.getItem('security_attempts') || '0');
            localStorage.setItem('security_attempts', (attempts + 1).toString());
            
            if (attempts >= 2) {
              window.location.href = YOUTUBE_REDIRECT_URL;
            }
            
            return false;
          }
        }, true); // true for capture phase - ensures this runs before other handlers
      });
      
      // Block context menu to prevent "Inspect" option
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
      }, true);
    };
    
    // Re-apply prevention every second to catch any dynamic page content
    setInterval(preventDevToolsShortcuts, 1000);
    
    // Run immediately
    preventDevToolsShortcuts();
  })();

  return {
    refreshProtection: () => {
      // Function to manually refresh protection (can be called after DOM changes)
    }
  };
};

// Export for TypeScript
export default initializeGlobalKeyboardGuard;
export { initializeGlobalKeyboardGuard };
