
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

  // Size-based detection with improved accuracy and higher thresholds
  const checkDevToolsSize = () => {
    // Using much higher thresholds to prevent false positives
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    // Only trigger for very large differences (350+ pixels)
    // This accounts for browser UI elements, zoom factors, and other screen elements
    if (widthDiff > 350 || heightDiff > 350) {
      if (!isDevToolsOpen) {
        // Triple validation to avoid false positives
        let falsePositiveCount = 0;
        
        // First check
        setTimeout(() => {
          const check1WidthDiff = window.outerWidth - window.innerWidth;
          const check1HeightDiff = window.outerHeight - window.innerHeight;
          
          if (check1WidthDiff > 350 || check1HeightDiff > 350) {
            // Second check after a delay
            setTimeout(() => {
              const check2WidthDiff = window.outerWidth - window.innerWidth;
              const check2HeightDiff = window.outerHeight - window.innerHeight;
              
              if (check2WidthDiff > 350 || check2HeightDiff > 350) {
                isDevToolsOpen = true;
                sendHeartbeat();
                blockConnection();
              }
            }, 1000);
          }
        }, 500);
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

  // More reliable detection techniques
  const setupAdvancedDetection = () => {
    // Only use reliable window dimension checks
    // Other methods are removed as they cause too many false positives
    
    // Monitor resize events which could indicate devtools opening
    window.addEventListener('resize', () => {
      // Check with reasonable thresholds
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      if (widthDiff > 250 || heightDiff > 250) {
        // Only mark as detected if we're very confident
        isDevToolsOpen = true;
        blockConnection();
      }
    });
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
