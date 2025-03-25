/**
 * Specialized module for detecting DevTools in Chromium-based browsers
 * Works with Chrome, Edge, Opera, Brave, and other Chromium browsers
 */
import axios from 'axios';

export const setupChromiumDetection = (callback: () => void) => {
  const YOUTUBE_REDIRECT_URL = 'https://www.youtube.com';
  let devToolsOpen = false;

  // Main detection function
  const detectDevTools = () => {
    // Only proceed with detection if we haven't already detected devtools
    if (devToolsOpen) return;
    
    // More reliable detection method based on window dimensions
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    // Much higher threshold (350+ pixels difference to avoid false positives)
    if (widthDiff > 350 || heightDiff > 350) {
      // Double-check to confirm it's not a false positive
      setTimeout(() => {
        const confirmWidthDiff = window.outerWidth - window.innerWidth;
        const confirmHeightDiff = window.outerHeight - window.innerHeight;
        
        if (confirmWidthDiff > 350 || confirmHeightDiff > 350) {
          devToolsOpen = true;
      
      // Notify server about detection
      try {
        axios.post('/api/security/devtools-detection', {
          devToolsOpen: true,
          browser: 'chromium',
          timestamp: Date.now(),
          token: localStorage.getItem('security_token') || ''
        }).catch(() => {});
      } catch (e) {
        // Silent fail
      }
      
      // Execute callback
      callback();
      
      // Redirect to YouTube (with a slight delay)
          setTimeout(() => {
            window.location.href = YOUTUBE_REDIRECT_URL;
          }, 500);
        }
      }, 1000);
    }
  };

  // Clear sensitive browser data
  const clearBrowserData = () => {
    // Clear localStorage except for critical items
    const criticalItems = ['security_token'];
    Object.keys(localStorage).forEach(key => {
      if (!criticalItems.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    sessionStorage.clear();

    // Remove cached elements
    const elements = document.querySelectorAll('video, .video-container, .player-wrapper, .sensitive-data');
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
        el.innerHTML = '';
      } else if (el instanceof HTMLVideoElement) {
        el.pause();
        el.src = '';
        el.load();
      }
    });

    // Remove any dynamic scripts that might contain sensitive data
    const scripts = document.querySelectorAll('script[data-dynamic="true"]');
    scripts.forEach(script => {
      script.remove();
    });
  };

  // Initial check
  detectDevTools();

  // Run checks periodically
  setInterval(detectDevTools, 1000);

  // Listen for specific events that might indicate devtools
  window.addEventListener('resize', () => {
    // Check if window dimensions suggest devtools is open
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > 200 || heightDiff > 200) {
      devToolsOpen = true;
      callback();
      window.location.href = YOUTUBE_REDIRECT_URL;
    }
  });

  return {
    isDevToolsOpen: () => devToolsOpen
  };
};