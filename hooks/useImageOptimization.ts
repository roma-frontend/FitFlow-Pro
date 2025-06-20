import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  lazy?: boolean;
  placeholder?: string;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export const useImageOptimization = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const [imageSrc, setImageSrc] = useState(options.placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const optimizeImageUrl = useCallback((originalSrc: string) => {
    if (!originalSrc) return '';
    
    // Если это уже оптимизированный URL, возвращаем как есть
    if (originalSrc.includes('w_') || originalSrc.includes('q_')) {
      return originalSrc;
    }

    // Добавляем параметры оптимизации
    const url = new URL(originalSrc);
    const params = new URLSearchParams();
    
    if (options.quality) {
      params.append('q', options.quality.toString());
    }
    
    if (options.format) {
      params.append('f', options.format);
    }
    
    // Автоматическое определение размера экрана
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      params.append('w', '400');
    } else if (screenWidth <= 1024) {
      params.append('w', '600');
    } else {
      params.append('w', '800');
    }
    
    url.search = params.toString();
    return url.toString();
  }, [options.quality, options.format]);

  const loadImage = useCallback(async () => {
    if (!src) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const optimizedSrc = optimizeImageUrl(src);
      
      // Предзагружаем изображение
      const img = new Image();
      img.onload = () => {
        setImageSrc(optimizedSrc);
        setIsLoading(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
        // Fallback к оригинальному изображению
        setImageSrc(src);
      };
      img.src = optimizedSrc;
    } catch (error) {
      setHasError(true);
      setIsLoading(false);
      setImageSrc(src);
    }
  }, [src, optimizeImageUrl]);

  useEffect(() => {
    if (options.lazy) {
      // Lazy loading будет обрабатываться Intersection Observer
      return;
    }
    
    loadImage();
  }, [loadImage, options.lazy]);

  return {
    src: imageSrc,
    isLoading,
    hasError,
    loadImage
  };
};

// Хук для Intersection Observer (lazy loading)
export const useLazyLoading = (callback: () => void, options = {}) => {
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(elementRef);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, callback, options]);

  return setElementRef;
};
