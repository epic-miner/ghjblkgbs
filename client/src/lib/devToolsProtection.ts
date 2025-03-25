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
    if (connectionBlocked) return;

    // Use multiple detection signals to confirm before blocking
    // This helps prevent false positives
    let detectionCount = 0;

    // Check if console is being used extensively (possible developer)
    if (window.console && window._console_log_count > 20) {
      detectionCount++;
    }

    // Check dimensions again for confirmation
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > threshold && heightDiff > threshold/2) {
      detectionCount += 2; // Give more weight to this signal
    }

    // Only proceed if we have strong confirmation
    if (detectionCount >= 2) {
      connectionBlocked = true;

      // Apply security measures
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
    }
  };

  // Size-based detection with improved accuracy and higher thresholds
  const checkDevToolsSize = () => {
    // Using much higher thresholds to prevent false positives
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    // Only trigger if both dimensions show significant differences
    // This helps avoid false positives from browser UI elements
    if (widthDiff > threshold && heightDiff > threshold/2) {
      // Add a small delay to ensure it's not a temporary window resize
      setTimeout(() => {
        const newWidthDiff = window.outerWidth - window.innerWidth;
        const newHeightDiff = window.outerHeight - window.innerHeight;

        // Only confirm if the condition persists
        if (newWidthDiff > threshold && newHeightDiff > threshold/2) {
          isDevToolsOpen = true;
          blockConnection();
        }
      }, 500);
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