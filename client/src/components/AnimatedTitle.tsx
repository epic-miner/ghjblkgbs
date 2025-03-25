import { ReactNode } from 'react';
import TextTransition, { presets } from 'react-text-transition';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTitleProps {
  text: string | string[];
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  delay?: number;
  direction?: 'up' | 'down';
  inline?: boolean;
  animation?: 'text-transition' | 'typewriter' | 'gradient' | 'fade-in';
  gradient?: string; // Custom gradient for Tailwind classes (from-x via-y to-z)
  children?: ReactNode;
}

const AnimatedTitle = ({
  text,
  className,
  tag = 'h1',
  springConfig = {},
  delay = 0,
  direction = 'up',
  inline = false,
  animation = 'text-transition',
  gradient,
  children,
}: AnimatedTitleProps) => {
  // Determine if text is an array or single string
  const textArray = Array.isArray(text) ? text : [text];
  
  // If text is not an array and animation is text-transition, use fade-in instead
  const effectiveAnimation = Array.isArray(text) || textArray.length > 1 
    ? animation 
    : animation === 'text-transition' ? 'fade-in' : animation;

  const Tag = tag;
  
  // Custom spring configuration
  const { 
    stiffness = 100, 
    damping = 10,
    mass = 1
  } = springConfig;
  
  const springProps = { stiffness, damping, mass };
  
  // For typewriter animation
  const typewriterVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { 
      width: "100%", 
      opacity: 1,
      transition: { 
        delay,
        duration: 1, 
        ease: "easeInOut" 
      }
    }
  };
  
  // For gradient animation
  const gradientStyle = {
    background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textFillColor: 'transparent',
  };
  
  if (effectiveAnimation === 'text-transition') {
    return (
      <Tag className={cn('inline-flex overflow-hidden', className)}>
        <TextTransition 
          springConfig={presets.gentle} 
          direction={direction === 'up' ? 'up' : 'down'} 
          delay={delay * 1000}
          inline={inline}
          className="overflow-hidden"
        >
          {textArray[0]}
        </TextTransition>
        {children}
      </Tag>
    );
  }
  
  if (effectiveAnimation === 'typewriter') {
    return (
      <Tag className={cn('relative inline-block overflow-hidden', className)}>
        <motion.span
          variants={typewriterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block whitespace-nowrap"
        >
          {textArray[0]}
        </motion.span>
        {children}
      </Tag>
    );
  }
  
  if (effectiveAnimation === 'gradient') {
    // Use either custom gradient via Tailwind classes or CSS style gradient
    if (gradient) {
      return (
        <Tag 
          className={cn('bg-gradient-to-r bg-clip-text text-transparent', gradient, className)}
        >
          {textArray[0]}
          {children}
        </Tag>
      );
    }
    
    return (
      <Tag 
        className={cn('animate-gradient-x', className)} 
        style={gradientStyle}
      >
        {textArray[0]}
        {children}
      </Tag>
    );
  }
  
  // Default fade-in animation
  return (
    <Tag className={cn('', className)}>
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay,
          duration: 0.6,
          ease: "easeOut"
        }}
        className="inline-block"
      >
        {textArray[0]}
      </motion.span>
      {children}
    </Tag>
  );
};

export default AnimatedTitle;