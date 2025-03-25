import { ReactNode } from 'react';
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
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
    rootMargin,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={animationVariants[animation]}
      transition={{ 
        duration, 
        delay,
        ease: 'easeOut',
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;