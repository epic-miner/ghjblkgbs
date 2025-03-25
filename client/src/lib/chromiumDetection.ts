
/**
 * Specialized module for detecting DevTools in Chromium-based browsers
 * Works with Chrome, Edge, Opera, Brave, and other Chromium browsers
 */
import axios from 'axios';

export const setupChromiumDetection = (callback: () => void) => {
  let detectionActive = true;
  let devToolsDetected = false;
  
  // Method 1: Debugger statement detection with improved accuracy
  const debuggerCheck = () => {
    try {
      const start = new Date().getTime();
      
      // This debugger statement will pause execution if DevTools is open
      debugger;
      
      const end = new Date().getTime();
      // Only trigger if time difference is significant (DevTools open)
      if (end - start > 100 && !devToolsDetected) {
        devToolsDetected = true;
        callback();
        return true;
      }
    } catch (e) {
      // Silently fail
    }
    return false;
  };
  
  // Method 2: Element dimension examination with higher precision
  const elementSizeCheck = () => {
    const element = document.createElement('div');
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.position = 'fixed';
    element.style.bottom = '0';
    element.style.right = '0';
    document.body.appendChild(element);
    
    // In Chromium browsers, element dimensions change when DevTools is open
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    document.body.removeChild(element);
    
    if ((width !== 1 || height !== 1) && !devToolsDetected) {
      devToolsDetected = true;
      callback();
      return true;
    }
    
    return false;
  };
  
  // Method 3: Console timing with improved thresholds
  const consoleTimingCheck = () => {
    const start = performance.now();
    console.clear();
    const end = performance.now();
    
    // Chromium browsers have significantly different timing when DevTools is open
    if (end - start > 20 && !devToolsDetected) {
      devToolsDetected = true;
      callback();
      return true;
    }
    
    return false;
  };
  
  // Method 4: Specific Chromium objects with more detailed checking
  const chromiumObjectsCheck = () => {
    // @ts-ignore
    if (window.chrome && (window.chrome.loadTimes || window.chrome.csi)) {
      // Create a test object with a getter that has side effects
      const testObject = document.createElement('div');
      let devToolsOpened = false;
      
      Object.defineProperty(testObject, 'id', {
        get: function() {
          devToolsOpened = true;
          return 'chromium-check';
        }
      });
      
      console.log(testObject);
      console.clear();
      
      if (devToolsOpened && !devToolsDetected) {
        devToolsDetected = true;
        callback();
        return true;
      }
    }
    
    return false;
  };
  
  // Method 5: Dev tools orientation detection
  const orientationCheck = () => {
    const isHorizontal = window.outerWidth - window.innerWidth > 160;
    const isVertical = window.outerHeight - window.innerHeight > 160;
    
    if ((isHorizontal || isVertical) && !devToolsDetected) {
      devToolsDetected = true;
      callback();
      return true;
    }
    
    return false;
  };
  
  // Run all detection methods periodically
  const runDetection = () => {
    if (!detectionActive) return;
    
    const detected = debuggerCheck() || 
                     elementSizeCheck() ||
                     consoleTimingCheck() || 
                     chromiumObjectsCheck() ||
                     orientationCheck();
    
    // Only keep checking if not yet detected
    if (detected) {
      // Reduce check frequency once detected to avoid performance impact
      detectionActive = false;
      setTimeout(() => {
        detectionActive = true;
      }, 10000); // Check again after 10 seconds
    }
  };
  
  // Initial detection
  runDetection();
  
  // Periodic checks
  const detectionInterval = setInterval(() => {
    runDetection();
  }, 1000);
  
  // Public API to stop detection
  return {
    stopDetection: () => {
      detectionActive = false;
      clearInterval(detectionInterval);
    },
    isDevToolsDetected: () => devToolsDetected
  };
};
