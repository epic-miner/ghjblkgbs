import axios from 'axios';

/**
 * DevTools detection and server security module
 * Detects developer tools and blocks data transmission
 */
export const setupDevToolsProtection = () => {
  const threshold = 160;
  let isDevToolsOpen = false;
  let connectionBlocked = false;

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

    // Add visible warning
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

        // Clear sensitive data from the page
        clearSensitiveData();
      }
    } catch (err) {
      // Error handling silently fails to prevent tampering
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
      }
    }
  };

  // Debug method tracing for console detection
  const detectConsoleOpen = () => {
    const startTime = performance.now();
    console.debug('');
    const endTime = performance.now();

    // Typically takes longer when dev tools are open
    if (endTime - startTime > 100) {
      isDevToolsOpen = true;
      sendHeartbeat();
    }
  };

  // Setup various detection methods
  window.addEventListener('resize', checkDevToolsSize);
  setInterval(checkDevToolsSize, 1000);
  setInterval(detectConsoleOpen, 1000);

  // Detection for Firebug and similar tools
  //@ts-ignore
  if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
    isDevToolsOpen = true;
    sendHeartbeat();
  }

  // Firefox dev tools detection
  //@ts-ignore
  if (typeof InstallTrigger !== 'undefined' && window.devtools?.open) {
    isDevToolsOpen = true;
    sendHeartbeat();
  }

  // Chrome DevTools detection (added for Chromium-based browsers)
  if (window.chrome && window.chrome.devtools) {
    isDevToolsOpen = true;
    sendHeartbeat();
  }

  // Request verification token from server on page load
  const initSecurity = async () => {
    try {
      const response = await axios.get('/api/security/token');
      if (response.data && response.data.token) {
        localStorage.setItem('security_token', response.data.token);
      }
    } catch (err) {
      // Silent fail
    }
  };

  initSecurity();

  return {
    isDevToolsOpen: () => isDevToolsOpen,
    isConnectionBlocked: () => connectionBlocked
  };
};