
import { useEffect } from 'react';
import { setupComprehensiveProtection } from '../lib/enhancedSecurity';
import { initializeAdvancedProtection } from '../lib/advancedProtection';

export function useEnhancedSecurity(videoPlayerRef?: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Apply existing protection
      setupComprehensiveProtection(videoPlayerRef?.current);
      
      // Apply new advanced protection
      initializeAdvancedProtection();
    }
    // Only apply in production to allow development
  }, [videoPlayerRef]);
}
