// components/ui/LazySection.tsx
'use client';

import { memo, Suspense, useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: boolean;
  className?: string;
}

const LazySection = memo(({ 
  children, 
  fallback = null,
  priority = false,
  className = ""
}: LazySectionProps) => {
  // 🚀 Отслеживаем готовность клиента
  const [isClient, setIsClient] = useState(false);
  
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({
    threshold: 0.1,
    rootMargin: priority ? "200px" : "100px",
    triggerOnce: true,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section ref={ref} className={className}>
      {/* 🚀 Показываем контент только когда клиент готов И элемент видим */}
      {isClient && isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : null}
    </section>
  );
});

LazySection.displayName = "LazySection";

export { LazySection };
