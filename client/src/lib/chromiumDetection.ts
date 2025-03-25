
/**
 * Specialized module for detecting DevTools in Chromium-based browsers
 * Works with Chrome, Edge, Opera, Brave, and other Chromium browsers
 */
import axios from 'axios';

export const setupChromiumDetection = (callback: () => void) => {
  let detectionActive = true;
  
  // Method 1: Debugger statement detection
  const debuggerCheck = () => {
    try {
      let counter = 0;
      const start = new Date().getTime();
      
      // This debugger statement will pause execution if DevTools is open
      debugger;
      
      const end = new Date().getTime();
      // Threshold determined by testing on various Chromium browsers
      if (end - start > 100) {
        callback();
        return true;
      }
    } catch (e) {
      // Silently fail
    }
    return false;
  };
  
  // Method 2: Element dimension examination
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
    
    if (width !== 1 || height !== 1) {
      callback();
      return true;
    }
    
    return false;
  };
  
  // Method 3: Console timing
  const consoleTimingCheck = () => {
    const start = performance.now();
    console.clear();
    const end = performance.now();
    
    // Chromium browsers have significantly different timing when DevTools is open
    if (end - start > 20) {
      callback();
      return true;
    }
    
    return false;
  };
  
  // Method 4: Specific Chromium objects
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
      
      if (devToolsOpened) {
        callback();
        return true;
      }
    }
    
    return false;
  };
  
  // Run all detection methods
  const runDetection = () => {
    if (!detectionActive) return;
    
    const detected = debuggerCheck() || 
                     elementSizeCheck() || 
                     consoleTimingCheck() || 
                     chromiumObjectsCheck();
    
    if (detected) {
      // Reduce check frequency after detection
      detectionActive = false;
      setTimeout(() => { detectionActive = true; }, 10000);
    }
  };
  
  // Run detection immediately and at intervals
  runDetection();
  
  // Use different intervals to make pattern detection harder
  setInterval(runDetection, 750);
  setTimeout(() => {
    setInterval(runDetection, 1234); // Odd interval to avoid pattern detection
  }, 500);
  
  // Cleanup function
  return () => {
    detectionActive = false;
  };
};
