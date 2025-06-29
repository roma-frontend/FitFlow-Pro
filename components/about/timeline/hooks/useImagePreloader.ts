// components/about/timeline/hooks/useImagePreloader.ts
import { useCallback, useEffect, useRef } from 'react';
import { TimelineEvent } from './useTimelineData';

export const useImagePreloader = (events: TimelineEvent[], currentIndex: number | null) => {
  const preloadedImages = useRef<Set<string>>(new Set());
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        imageCache.current.set(src, img);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadAdjacentImages = useCallback(async (index: number) => {
    if (index === null || index === undefined) return;

    const indicesToPreload = [
      (index - 1 + events.length) % events.length,
      (index + 1) % events.length,
      index // Текущее изображение
    ];

    const preloadPromises = indicesToPreload.map(i => 
      preloadImage(events[i].image)
    );

    try {
      await Promise.all(preloadPromises);
    } catch (error) {
      console.warn('Failed to preload some images:', error);
    }
  }, [events, preloadImage]);

  useEffect(() => {
    if (currentIndex !== null && currentIndex !== undefined) {
      preloadAdjacentImages(currentIndex);
    }
  }, [currentIndex, preloadAdjacentImages]);

  return {
    preloadImage,
    preloadAdjacentImages,
    isImagePreloaded: useCallback((src: string) => preloadedImages.current.has(src), []),
    getPreloadedImage: useCallback((src: string) => imageCache.current.get(src), [])
  };
};
