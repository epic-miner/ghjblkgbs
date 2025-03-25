
import devtoolsDetect from 'devtools-detect';
import DisableDevtool from 'disable-devtool';

export const setupEnhancedDevToolsProtection = (onDetected: () => void = () => {}) => {
  const redirectToYoutube = () => {
    // Call any custom handler first if provided
    onDetected();
    
    // Then redirect to YouTube
    window.location.href = 'https://www.youtube.com';
  };

  // Use devtools-detect package
  window.addEventListener('devtoolschange', (event: any) => {
    if (event.detail.isOpen) {
      redirectToYoutube();
    }
  });

  // Use disable-devtool package with advanced options
  DisableDevtool({
    ondevtoolopen: redirectToYoutube,
    interval: 1000,
    disableMenu: true,
    disableSelect: true,
    disableCopy: true,
    disableCut: true,
    disablePaste: true
  });
};

// Combine with your existing security measures
export const setupComprehensiveProtection = (videoPlayerContainer?: HTMLElement) => {
  // Import existing security functions if needed in the same file
  const { 
    detectDevTools, 
    preventKeyboardShortcuts, 
    disableConsole, 
    preventTextSelection,
    preventIframeEmbedding,
    initializeSecurity,
    initializeGlobalSecurity 
  } = require('./security');

  // Setup enhanced protection
  setupEnhancedDevToolsProtection(() => {
    // Create a full-screen blocker or take other actions
    const blockerDiv = document.createElement('div');
    blockerDiv.style.position = 'fixed';
    blockerDiv.style.top = '0';
    blockerDiv.style.left = '0';
    blockerDiv.style.width = '100%';
    blockerDiv.style.height = '100%';
    blockerDiv.style.backgroundColor = 'black';
    blockerDiv.style.zIndex = '999999';
    blockerDiv.style.display = 'flex';
    blockerDiv.style.alignItems = 'center';
    blockerDiv.style.justifyContent = 'center';
    blockerDiv.style.color = 'white';
    blockerDiv.style.fontSize = '20px';
    blockerDiv.textContent = 'Access Denied - Developer Tools Detected';
    document.body.appendChild(blockerDiv);
  });

  // Apply existing security measures
  preventKeyboardShortcuts();
  disableConsole();
  preventIframeEmbedding();
  initializeGlobalSecurity();
  
  // Apply video-specific protection if container is provided
  if (videoPlayerContainer) {
    initializeSecurity(videoPlayerContainer);
  }
};
