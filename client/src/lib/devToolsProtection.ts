
import axios from 'axios';

/**
 * DevTools detection and server security module
 * Detects developer tools and blocks data transmission
 */
export const setupDevToolsProtection = () => {
  const threshold = 160;
  let isDevToolsOpen = false;
  let connectionBlocked = false;
  const YOUTUBE_REDIRECT_URL = 'https://www.youtube.com';

  // Function to clear sensitive data from the page
  const clearSensitiveData = () => {
    // Hide content by blurring or removing elements
    const sensitiveElements = document.querySelectorAll('.sensitive-data, video, .player-container');
    sensitiveElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.filter = 'blur(20px)';
        el.setAttribute('data-secured', 'true');
      }
    });

    // Clear any in-memory cached data
    localStorage.removeItem('video_data');
    sessionStorage.clear();
    
    // Remove any potential cached content
    const cache = window.caches;
    if (cache && typeof cache.delete === 'function') {
      cache.keys().then(keyList => {
        Promise.all(keyList.map(key => cache.delete(key)));
      }).catch(() => {});
    }
  };

  // Block connection and add warning
  const blockConnection = () => {
    // Already blocked? Don't do anything
    if (connectionBlocked) return;
    
    try {
      // Clear sensitive data from the page
      clearSensitiveData();
      
      // Add visible warning before redirect
      const warning = document.createElement('div');
      warning.style.position = 'fixed';
      warning.style.top = '0';
      warning.style.left = '0';
      warning.style.width = '100%';
      warning.style.height = '100%';
      warning.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      warning.style.color = 'red';
      warning.style.display = 'flex';
      warning.style.alignItems = 'center';
      warning.style.justifyContent = 'center';
      warning.style.zIndex = '999999';
      warning.style.fontSize = '24px';
      warning.style.textAlign = 'center';
      warning.style.padding = '20px';
      warning.innerHTML = '<strong>Security Alert</strong><br>Developer tools detected.<br>Connection blocked for security reasons.';
      document.body.appendChild(warning);
      
      // After brief delay, redirect to YouTube
      setTimeout(() => {
        window.location.href = YOUTUBE_REDIRECT_URL;
      }, 2000);
    } catch (err) {
      // Error handling silently fails to prevent tampering
      window.location.href = YOUTUBE_REDIRECT_URL;
    }
  };

  // Size-based detection
  const checkDevToolsSize = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        sendHeartbeat();
        blockConnection();
      }
    }
  };

  // Setup a heartbeat to inform server about devtools state
  const sendHeartbeat = async () => {
    try {
      if (isDevToolsOpen && !connectionBlocked) {
        // Signal to the server that devtools are open
        await axios.post('/api/security/devtools-detection', { 
          devToolsOpen: true,
          timestamp: Date.now(),
          token: localStorage.getItem('security_token') || ''
        });
        connectionBlocked = true;
      }
    } catch (err) {
      // Silent fail to avoid revealing information
    }
  };

  // Advanced detection techniques
  const setupAdvancedDetection = () => {
    // Detect debugger statements (common in devtools)
    try {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      
      // If debugger takes too long, likely devtools are open
      if (endTime - startTime > 100) {
        isDevToolsOpen = true;
        blockConnection();
      }
    } catch (e) {
      // Silent fail
    }
    
    // Detect console.log overrides (often done in devtools)
    const originalLog = console.log;
    console.log = function() {
      if (arguments[0] === '%c') {
        isDevToolsOpen = true;
        blockConnection();
      }
      return originalLog.apply(this, arguments);
    };
    
    // Test console styling (only works in devtools)
    console.log('%c', 'font-size:0;');
    
    // Advanced detection for Firefox
    const div = document.createElement('div');
    Object.defineProperty(div, 'id', {
      get: function() {
        isDevToolsOpen = true;
        blockConnection();
        return 'id';
      }
    });
    console.log(div);
  };

  // Request verification token from server on page load
  const initSecurity = async () => {
    try {
      // Apply keyboard shortcut prevention
      preventDevToolsShortcuts();
      
      const response = await axios.get('/api/security/token');
      if (response.data && response.data.token) {
        localStorage.setItem('security_token', response.data.token);
      }
      
      // Initial checks
      setupAdvancedDetection();
      checkDevToolsSize();
      
      // Periodic checks
      setInterval(checkDevToolsSize, 1000);
      setInterval(setupAdvancedDetection, 2000);
    } catch (err) {
      // Silent fail
    }
  };

  // Prevent keyboard shortcuts
  const preventDevToolsShortcuts = () => {
    window.addEventListener('keydown', (e) => {
      // Detect common dev tools shortcuts
      if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) || 
          (e.key === 'F12') || 
          (e.ctrlKey && e.altKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
        e.stopPropagation();
        isDevToolsOpen = true;
        blockConnection();
        return false;
      }
    }, true);
  };

  initSecurity();

  return {
    isDevToolsOpen: () => isDevToolsOpen,
    isConnectionBlocked: () => connectionBlocked
  };
};
