
import { useEffect } from 'react';
import { setupComprehensiveProtection } from '../lib/enhancedSecurity';

export function useEnhancedSecurity(videoPlayerRef?: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setupComprehensiveProtection(videoPlayerRef?.current);
    }
    // Only apply in production to allow development
  }, [videoPlayerRef]);
}
