
import devtoolsDetect from 'devtools-detect';
import DisableDevtool from 'disable-devtool';

// Advanced detection system that uses multiple methods to detect dev tools
export const setupAdvancedProtection = () => {
  // Use devtools-detect package for detection
  window.addEventListener('devtoolschange', (event: any) => {
    if (event.detail.isOpen) {
      window.location.href = 'https://www.youtube.com';
    }
  });
  
  // Setup DisableDevtool with comprehensive options
  DisableDevtool({
    ondevtoolopen: () => {
      window.location.href = 'https://www.youtube.com';
    },
    interval: 1000,
    disableMenu: true,
    disableSelect: true,
    disableCopy: true,
    disableCut: true,
    disablePaste: true
  });
  
  // Additional window property checks for dev tools
  const widthThreshold = 160;
  
  // Check for size discrepancy 
  const checkDevToolsSize = () => {
    const widthDiff = window.outerWidth - window.innerWidth > widthThreshold;
    const heightDiff = window.outerHeight - window.innerHeight > widthThreshold;
    
    if (widthDiff || heightDiff) {
      window.location.href = 'https://www.youtube.com';
    }
  };
  
  // Multiple event listeners for different detection methods
  window.addEventListener('resize', checkDevToolsSize);
  setInterval(checkDevToolsSize, 1000);
  
  // Prevent right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Prevent F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Chrome, Firefox)
    if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+U (View source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
    
    return true;
  });
  
  // Console warning and clearing
  const warningMessage = 
    'This site is protected. Using developer tools may result in your session being terminated.';
  
  console.clear();
  console.log('%c', 'font-size:0;');
  console.warn(warningMessage);
  
  // Add additional protection by overriding console methods
  const consoleProtection = () => {
    const originalConsole = { ...console };
    console.log = function() {
      originalConsole.log('%c', 'font-size:0;', ...arguments);
    };
    console.debug = function() {
      originalConsole.debug('%c', 'font-size:0;', ...arguments);
    };
    console.info = function() {
      originalConsole.info('%c', 'font-size:0;', ...arguments);
    };
    console.warn = function() {
      originalConsole.warn('%c', 'font-size:0;', ...arguments);
    };
    console.error = function() {
      originalConsole.error('%c', 'font-size:0;', ...arguments);
    };
    
    setInterval(() => {
      console.clear();
      console.warn(warningMessage);
    }, 2000);
  };
  
  consoleProtection();
};
