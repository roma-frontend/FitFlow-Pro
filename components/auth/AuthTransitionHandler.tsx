// components/auth/AuthTransitionHandler.tsx
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoaderStore } from '@/stores/loaderStore';
import { Loader2 } from 'lucide-react';

export function AuthTransitionHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoaderStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Обработка переходов на login страницы
    const handleRouteChange = () => {
      // Если идет переход на login страницу
      if (pathname.includes('login') || pathname === '/register') {
        const isRedirecting = sessionStorage.getItem('is_redirecting') === 'true';
        
        if (isRedirecting) {
          setIsTransitioning(true);
          // Скрываем переход на 300ms
          setTimeout(() => {
            setIsTransitioning(false);
            sessionStorage.removeItem('is_redirecting');
          }, 300);
        }
      }
    };

    handleRouteChange();
  }, [pathname]);

  // Показываем минимальный loader во время переходов
  if (isTransitioning) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return null;
}