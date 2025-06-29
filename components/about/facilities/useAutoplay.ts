// components/about/facilities/useAutoplay.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoplayProps {
  isPlaying: boolean;
  onNext: () => void;
  delay?: number;
}

export function useAutoplay({ isPlaying, onNext, delay = 5000 }: UseAutoplayProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);

  // Обновляем ref при изменении isPlaying
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (!intervalRef.current && isPlayingRef.current) {
      intervalRef.current = setInterval(() => {
        onNext();
      }, delay);
    }
  }, [onNext, delay]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onNext();
      }, delay);
    } else {
      pause();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, onNext, delay, pause]);

  return { pause, resume };
}
