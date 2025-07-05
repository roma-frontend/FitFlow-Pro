// components/auth/GoogleAuthHandler.tsx - ПОКАЗЫВАЕТ LOADER ПОСЛЕ ВОЗВРАТА ОТ GOOGLE
"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLoaderStore } from '@/stores/loaderStore';
import { useRouter, useSearchParams } from 'next/navigation';

export function GoogleAuthHandler() {
  const { data: session, status } = useSession();
  const showLoader = useLoaderStore((state) => state.showLoader);
  const hideLoader = useLoaderStore((state) => state.hideLoader);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Проверяем параметры URL для определения возврата от Google
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const googleLoginInProgress = sessionStorage.getItem('google_login_in_progress');
      
      // Если есть code и state от Google OAuth И у нас был флаг входа
      if (code && state && googleLoginInProgress === 'true' && !isProcessing) {
        console.log('🔄 Обнаружен возврат от Google OAuth');
        setIsProcessing(true);
        
        // Устанавливаем флаг редиректа
        sessionStorage.setItem('is_redirecting', 'true');
        
        const isStaff = sessionStorage.getItem('google_login_is_staff') === 'true';
        const targetUrl = sessionStorage.getItem('google_login_target_url') || 
                         (isStaff ? '/admin' : '/member-dashboard');
        
        // ТЕПЕРЬ показываем loader после возврата от Google
        showLoader("login", {
          userRole: isStaff ? "admin" : "member",
          userName: "Авторизация через Google",
          dashboardUrl: targetUrl
        });
        
        // Ждем пока сессия обновится
        if (status === 'loading') {
          console.log('⏳ Ожидаем обновления сессии...');
          return; // Выходим и ждем следующего вызова useEffect
        }
        
        // Если сессия готова и пользователь авторизован
        if (status === 'authenticated' && session?.user) {
          console.log('✅ Google OAuth успешно завершен');
          
          // Очищаем флаги
          sessionStorage.removeItem('google_login_in_progress');
          sessionStorage.removeItem('google_login_is_staff');
          sessionStorage.removeItem('google_login_target_url');
          
          // Ждем анимацию loader и делаем редирект
          setTimeout(() => {
            console.log('🚀 Redirecting to:', targetUrl);
            window.location.replace(targetUrl);
          }, 1500);
        }
      }
      // Если статус изменился на authenticated, но мы уже обрабатываем
      else if (status === 'authenticated' && isProcessing && session?.user) {
        const targetUrl = sessionStorage.getItem('google_login_target_url') || '/member-dashboard';
        
        // Очищаем флаги
        sessionStorage.removeItem('google_login_in_progress');
        sessionStorage.removeItem('google_login_is_staff');
        sessionStorage.removeItem('google_login_target_url');
        
        // Делаем финальный редирект
        setTimeout(() => {
          console.log('🚀 Final redirect to:', targetUrl);
          window.location.replace(targetUrl);
        }, 1500);
      }
    };

    handleGoogleCallback();
  }, [status, session, searchParams, showLoader, isProcessing]);

  return null;
}