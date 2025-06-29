// components/about/facilities/useAutoplay.ts
import { useEffect, useRef } from 'react';

interface UseAutoplayProps {
  isPlaying: boolean;
  onNext: () => void;
  delay?: number;
}

export function useAutoplay({ isPlaying, onNext, delay = 5000 }: UseAutoplayProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onNext();
      }, delay);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, onNext, delay]);

  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resume = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        onNext();
      }, delay);
    }
  };

  return { pause, resume };
}
