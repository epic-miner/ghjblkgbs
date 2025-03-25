import { ReactNode, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'none';
  delay?: number;
  duration?: number;
  rootMargin?: string;
}

const animationVariants = {
  'fade': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  'zoom': {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  'none': {
    hidden: {},
    visible: {},
  },
};

// Simpler animation variants for mobile to reduce processing
const mobileAnimationVariants = {
  'fade': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 20 }, // Smaller movement on mobile
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -20 }, // Smaller movement on mobile
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 20 }, // Smaller movement on mobile
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -20 }, // Smaller movement on mobile
    visible: { opacity: 1, x: 0 },
  },
  'zoom': {
    hidden: { opacity: 0, scale: 0.9 }, // Less scaling on mobile
    visible: { opacity: 1, scale: 1 },
  },
  'none': {
    hidden: {},
    visible: {},
  },
};

const ScrollReveal = ({
  children,
  className,
  threshold = 0.1,
  triggerOnce = true,
  animation = 'fade',
  delay = 0,
  duration = 0.5,
  rootMargin = '0px',
}: ScrollRevealProps) => {
  // Detect if device is likely mobile for performance optimization
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check once on mount if screen is small or if device has touch capability
    const checkMobile = () => {
      return window.innerWidth < 768 || ('ontouchstart' in window);
    };
    
    setIsMobile(checkMobile());
  }, []);
  
  const { ref, inView } = useInView({
    threshold: isMobile ? Math.min(threshold, 0.05) : threshold, // Lower threshold on mobile
    triggerOnce,
    rootMargin,
  });

  // Use simpler animations and faster transitions on mobile
  const variants = isMobile ? mobileAnimationVariants : animationVariants;
  const effectiveDuration = isMobile ? Math.min(duration, 0.3) : duration; // Cap duration on mobile
  const effectiveDelay = isMobile ? 0 : delay; // No delay on mobile

  // For extreme performance optimization on low-end mobile devices
  if (isMobile && animation === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants[animation]}
      transition={{ 
        duration: effectiveDuration, 
        delay: effectiveDelay,
        ease: 'easeOut',
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;