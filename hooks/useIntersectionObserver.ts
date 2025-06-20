// hooks/useIntersectionObserver.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

// 🚀 ОСНОВНОЙ хук с правильной типизацией
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefCallback<T>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = true } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ✅ Используем RefCallback вместо RefObject для избежания проблем с null
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    // 🚀 Проверяем поддержку IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback для SSR и старых браузеров - считаем что элемент видим
      setIsIntersecting(true);
      return;
    }

    // Отключаем предыдущий observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        // Если triggerOnce = true и элемент показался, отключаем наблюдение
        if (triggerOnce && entry.isIntersecting && observerRef.current) {
          observerRef.current.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [element, threshold, root, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
}

// 🚀 АЛЬТЕРНАТИВНЫЙ хук с useRef (более привычный синтаксис)
export function useInView<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions & { 
    initialInView?: boolean;
    skip?: boolean;
  } = {}
): [React.RefObject<T | null>, boolean] {
  const { 
    threshold = 0, 
    root = null, 
    rootMargin = '0px', 
    triggerOnce = false,
    initialInView = false,
    skip = false
  } = options;
  
  const [isInView, setIsInView] = useState(initialInView);
  // ✅ Правильная типизация - T | null явно указывает что может быть null
  const ref = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (skip) return;

    const element = ref.current;
    if (!element) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    // Отключаем предыдущий observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        
        if (triggerOnce && inView && observerRef.current) {
          observerRef.current.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, root, rootMargin, triggerOnce, skip]);

  return [ref, isInView];
}

// 🚀 УПРОЩЕННЫЙ хук для быстрого использования
export function useVisibility<T extends HTMLElement = HTMLElement>(
  threshold = 0.1,
  rootMargin = '50px'
): [React.RefCallback<T>, boolean] {
  return useIntersectionObserver<T>({
    threshold,
    rootMargin,
    triggerOnce: true,
  });
}

// 🚀 ХУК для множественных элементов
export function useIntersectionObserverMultiple<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = true } = options;
  const [intersectingElements, setIntersectingElements] = useState<Set<T>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<T, boolean>>(new Map());

  const observe = useCallback((element: T | null) => {
    if (!element || elementsRef.current.has(element)) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIntersectingElements(prev => new Set([...prev, element]));
      return;
    }

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as T;
            setIntersectingElements(prev => {
              const newSet = new Set(prev);
              if (entry.isIntersecting) {
                newSet.add(target);
                if (triggerOnce && observerRef.current) {
                  observerRef.current.unobserve(target);
                  elementsRef.current.delete(target);
                }
              } else {
                newSet.delete(target);
              }
              return newSet;
            });
          });
        },
        { threshold, root, rootMargin }
      );
    }

    elementsRef.current.set(element, true);
    observerRef.current.observe(element);
  }, [threshold, root, rootMargin, triggerOnce]);

  const unobserve = useCallback((element: T) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
      setIntersectingElements(prev => {
        const newSet = new Set(prev);
        newSet.delete(element);
        return newSet;
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { observe, unobserve, intersectingElements };
}
