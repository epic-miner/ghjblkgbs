
import { useEffect } from 'react';

export const useConsoleProtection = () => {
  useEffect(() => {
    const threshold = 160;
    let isDevToolsOpen = false;
    let blockerDiv: HTMLDivElement | null = null;

    const createBlocker = () => {
      if (!blockerDiv) {
        blockerDiv = document.createElement('div');
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
        blockerDiv.textContent = 'Website access restricted - Developer tools detected';
        document.body.appendChild(blockerDiv);
      }
    };

    const removeBlocker = () => {
      if (blockerDiv) {
        document.body.removeChild(blockerDiv);
        blockerDiv = null;
      }
    };

    const checkDevTools = () => {
      // Using a much higher threshold to avoid false positives
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      // Higher threshold (200px) to avoid detecting browser UI elements as DevTools
      if (widthDiff > 200 || heightDiff > 200) {
        // Only mark as open if we're confident
        if (!isDevToolsOpen) {
          // Double-check after a delay to confirm it's not a temporary UI change
          setTimeout(() => {
            const newWidthDiff = window.outerWidth - window.innerWidth;
            const newHeightDiff = window.outerHeight - window.innerHeight;
            
            if (newWidthDiff > 200 || newHeightDiff > 200) {
              isDevToolsOpen = true;
              createBlocker();
            }
          }, 1000);
        }
      } else {
        isDevToolsOpen = false;
        removeBlocker();
      }
    };

    window.addEventListener('resize', checkDevTools);
    setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener('resize', checkDevTools);
      removeBlocker();
    };
  }, []);
};
