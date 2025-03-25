
import axios from 'axios';

/**
 * DevTools detection and server security module
 * Detects developer tools and blocks data transmission
 */
export const setupDevToolsProtection = () => {
  const threshold = 160;
  let isDevToolsOpen = false;
  let connectionBlocked = false;
  
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

  // Clear sensitive content from the page
  const clearSensitiveData = () => {
    // Create blocking overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999999';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'black';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.padding = '20px';
    overlay.style.textAlign = 'center';
    
    const message = document.createElement('h1');
    message.textContent = 'Access Denied';
    
    const details = document.createElement('p');
    details.textContent = 'Developer tools detected. For security reasons, access to content has been blocked.';
    
    overlay.appendChild(message);
    overlay.appendChild(details);
    document.body.appendChild(overlay);
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Attempt to clear video sources and other media
    document.querySelectorAll('video, audio').forEach(media => {
      if (media instanceof HTMLMediaElement) {
        media.pause();
        media.src = '';
        media.load();
      }
    });
    
    // Clear iframes
    document.querySelectorAll('iframe').forEach(iframe => {
      iframe.src = 'about:blank';
    });
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
