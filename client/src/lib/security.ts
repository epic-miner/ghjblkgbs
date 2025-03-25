// Security utilities for content protection

// Console protection
const disableConsole = () => {
  const noop = () => undefined;
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace'];

  // Save original console methods for our own use
  const originalConsole = {
    warn: console.warn,
    error: console.error
  };

  // Override all console methods
  methods.forEach(method => {
    console[method] = noop;
  });

  // Add warning for console access
  const showWarning = () => {
    originalConsole.warn(
      '%cStop!', 
      'color: red; font-size: 30px; font-weight: bold;'
    );
    originalConsole.warn(
      '%cThis is a security feature of our video player. Console access is restricted.',
      'color: red; font-size: 16px;'
    );
    originalConsole.warn(
      '%cAttempting to bypass security measures is prohibited.',
      'color: red; font-size: 16px;'
    );
  };

  // Periodically clear console and show warning
  setInterval(() => {
    console.clear();
    showWarning();
  }, 100);

  // Additional protection against console overrides
  Object.defineProperty(window, 'console', {
    get: function() {
      return {
        log: noop,
        info: noop,
        warn: noop,
        error: noop,
        debug: noop,
        trace: noop,
        clear: noop
      };
    },
    set: function() {
      return false;
    }
  });
};

// DevTools detection with enhanced monitoring
export const detectDevTools = (callback: () => void) => {
  const threshold = 160;
  let isDevToolsOpen = false;
  
  // Create a function that both calls the callback and redirects
  const handleDevToolsDetection = () => {
    callback();
    window.location.href = 'https://www.youtube.com';
  };

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        handleDevToolsDetection();
      }
    } else {
      isDevToolsOpen = false;
    }
  };

  // Multiple detection methods
  window.addEventListener('resize', checkDevTools);
  window.addEventListener('mousemove', checkDevTools);
  setInterval(checkDevTools, 1000);

  // Additional detection methods
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      isDevToolsOpen = true;
      handleDevToolsDetection();
      return '';
    }
  });

  // Check for Firefox dev tools
  //@ts-ignore
  if (window.devtools?.open) {
    isDevToolsOpen = true;
    handleDevToolsDetection();
  }

  // Regular checking
  setInterval(() => {
    for (let i = 0; i < 100; i++) {
      console.debug(element);
    }
  }, 1000);
};

// Keep the rest of the file unchanged
export const preventKeyboardShortcuts = () => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Prevent F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl+Shift+I/J (Dev tools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl+U (View source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl+S (Save page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }

    // Prevent copy/paste/cut operations globally
    if (e.ctrlKey && (
      e.key === 'C' || e.key === 'c' ||
      e.key === 'V' || e.key === 'v' ||
      e.key === 'X' || e.key === 'x'
    )) {
      const target = e.target as HTMLElement;
      // Allow copy/paste in form elements only
      if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        e.preventDefault();
        return false;
      }
    }

    return true;
  });

  // Additional clipboard protection
  document.addEventListener('copy', (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('cut', (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('paste', (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      e.preventDefault();
      return false;
    }
  });
};

// Right-click prevention for specific element
export const preventRightClick = (element: HTMLElement) => {
  element.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault();
    return false;
  });
};

// Global right-click prevention
export const initializeGlobalRightClickPrevention = () => {
  document.addEventListener('contextmenu', (e: MouseEvent) => {
    // Allow right-click on form elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return true;
    }

    // Prevent right-click on everything else
    e.preventDefault();
    return false;
  });

  // Additional mouse event prevention
  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button === 2) { // Right mouse button
      e.preventDefault();
      return false;
    }
  });

  // Prevent dragging of elements
  document.addEventListener('dragstart', (e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea')) {
      e.preventDefault();
      return false;
    }
  });
};

// Text selection prevention
export const preventTextSelection = (element: HTMLElement) => {
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';

  element.addEventListener('selectstart', (e: Event) => {
    e.preventDefault();
    return false;
  });
};

// Iframe protection
export const preventIframeEmbedding = () => {
  if (window.self !== window.top) {
    window.top!.location.href = window.self.location.href;
  }
};

// Initialize all security measures for video player
export const initializeSecurity = (videoPlayerContainer: HTMLElement) => {
  try {
    preventTextSelection(videoPlayerContainer);
    
    videoPlayerContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  } catch (error) {
    console.warn('Some security features could not be initialized:', error);
  }
};

// Initialize global security measures
export const initializeGlobalSecurity = () => {
  try {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  } catch (error) {
    console.warn('Some security features could not be initialized:', error);
  }
};