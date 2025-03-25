
import detectDevTools from 'detect-browser-devtools';
import * as htmlGuard from 'html-guard';

// Advanced detection system that uses multiple methods to detect dev tools
export const setupAdvancedProtection = () => {
  // Detect-browser-devtools provides another detection mechanism
  detectDevTools({
    // Check for dev tools every 1000ms
    interval: 1000,
    // What to do when dev tools are detected
    callback: (isOpen) => {
      if (isOpen) {
        window.location.href = 'https://www.youtube.com';
      }
    }
  });
  
  // Html-Guard protection (protects HTML elements from inspection)
  htmlGuard.protect({
    // When tampering is detected
    onTamperDetected: () => {
      window.location.href = 'https://www.youtube.com';
    },
    // Check for tampering every 500ms
    checkInterval: 500,
    // Protect these elements
    protectedElements: ['video', '.video-player', '.player-container']
  });
  
  // Additional window property checks
  const checkDevToolsProperties = () => {
    // Firefox dev tools detection
    if (window.console && (window.console as any).firebug) {
      window.location.href = 'https://www.youtube.com';
    }
    
    // Chrome and Edge dev tools detection
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || 
        (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
      window.location.href = 'https://www.youtube.com';
    }
  };
  
  // Run checks periodically
  setInterval(checkDevToolsProperties, 1000);
  
  // One-time checks for specific browser extensions
  setTimeout(() => {
    // Check for dev tool extensions
    if (document.getElementById('react-devtools-hook-div') ||
        document.getElementById('__react-devtools-browser-extension')) {
      window.location.href = 'https://www.youtube.com';
    }
  }, 2000);
};

// Function to apply source code protection via obfuscation
// Note: The actual obfuscation happens during build time using javascript-obfuscator
export const applyRunTimeProtection = () => {
  // Runtime checks that make debugging harder
  (function preventDebugging() {
    const startTime = new Date().getTime();
    debugger; // This statement triggers debugger - if dev tools are open, execution will pause here
    const endTime = new Date().getTime();
    
    // If execution took too long, dev tools might be open
    if (endTime - startTime > 100) {
      window.location.href = 'https://www.youtube.com';
    }
    
    // Schedule the next check
    setTimeout(preventDebugging, 1000);
  })();
};

// Combined protection system
export const initializeAdvancedProtection = () => {
  if (process.env.NODE_ENV === 'production') {
    setupAdvancedProtection();
    applyRunTimeProtection();
  }
};
