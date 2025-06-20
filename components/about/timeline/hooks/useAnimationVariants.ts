// components/about/timeline/hooks/useAnimationVariants.ts
import { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useOptimizedAnimation } from './useOptimizedAnimation';

export const useAnimationVariants = () => {
  const shouldReduceMotion = useReducedMotion();
  const { getOptimizedDuration, getOptimizedEasing } = useOptimizedAnimation();

  const variants = useMemo(() => ({
    modalVariants: {
      initial: { 
        opacity: 0,
        scale: shouldReduceMotion ? 1 : 0.95,
        y: shouldReduceMotion ? 0 : 20
      },
      animate: { 
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: getOptimizedDuration(0.4),
          ease: getOptimizedEasing(),
          opacity: { duration: getOptimizedDuration(0.3) },
          scale: { duration: getOptimizedDuration(0.35) }
        }
      },
      exit: { 
        opacity: 0,
        scale: shouldReduceMotion ? 1 : 0.98,
        y: shouldReduceMotion ? 0 : -10,
        transition: {
          duration: getOptimizedDuration(0.25),
          ease: "easeInOut"
        }
      }
    },

    imageVariants: {
      initial: (direction: 'next' | 'prev' | null) => ({
        opacity: 0,
        scale: shouldReduceMotion ? 1 : 1.05,
        x: shouldReduceMotion ? 0 : (direction === 'next' ? 30 : direction === 'prev' ? -30 : 0)
      }),
      animate: {
        opacity: 1,
        scale: 1,
        x: 0,
        transition: {
          duration: getOptimizedDuration(0.5),
          ease: getOptimizedEasing(),
          opacity: { duration: getOptimizedDuration(0.4) }
        }
      },
      exit: (direction: 'next' | 'prev' | null) => ({
        opacity: 0,
        scale: shouldReduceMotion ? 1 : 0.98,
        x: shouldReduceMotion ? 0 : (direction === 'next' ? -20 : direction === 'prev' ? 20 : 0),
        transition: {
          duration: getOptimizedDuration(0.3),
          ease: "easeInOut"
        }
      })
    },

    contentVariants: {
      initial: (direction: 'next' | 'prev' | null) => ({
        opacity: 0,
        x: shouldReduceMotion ? 0 : (direction === 'next' ? 25 : direction === 'prev' ? -25 : 15)
      }),
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: getOptimizedDuration(0.4),
          delay: shouldReduceMotion ? 0 : getOptimizedDuration(0.1),
          ease: getOptimizedEasing()
        }
      },
      exit: (direction: 'next' | 'prev' | null) => ({
        opacity: 0,
        x: shouldReduceMotion ? 0 : (direction === 'next' ? -15 : direction === 'prev' ? 15 : -10),
        transition: {
          duration: getOptimizedDuration(0.25),
          ease: "easeInOut"
        }
      })
    },

    staggerVariants: {
      initial: { 
        opacity: 0, 
        y: shouldReduceMotion ? 0 : 15 
      },
      animate: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: getOptimizedDuration(0.4),
          delay: shouldReduceMotion ? 0 : getOptimizedDuration(i * 0.08),
          ease: getOptimizedEasing()
        }
      })
    }
  }), [shouldReduceMotion, getOptimizedDuration, getOptimizedEasing]);

  return variants;
};
