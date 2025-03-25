
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
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          createBlocker();
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
