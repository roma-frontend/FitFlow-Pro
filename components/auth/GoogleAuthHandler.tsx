// components/auth/GoogleAuthHandler.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLoaderStore } from '@/stores/loaderStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import StaffLoginLoader from '@/app/staff-login/components/StaffLoginLoader';

export function GoogleAuthHandler() {
  const { data: session, status } = useSession();
  const { showLoader, hideLoader, loaderType, loaderProps } = useLoaderStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false);

  // НОВОЕ: Показываем loader сразу при обнаружении возврата от Google
  useEffect(() => {
    // Проверяем параметры возврата от Google OAuth
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const googleLoginInProgress = sessionStorage.getItem('google_login_in_progress');
    
    // Если есть признаки возврата от Google - СРАЗУ показываем loader
    if (code && state && googleLoginInProgress === 'true' && !processedRef.current) {
      console.log('🔄 Обнаружен возврат от Google OAuth - показываем loader немедленно');
      processedRef.current = true;
      
      const isStaff = sessionStorage.getItem('google_login_is_staff') === 'true';
      const savedTarget = sessionStorage.getItem('google_login_target_url');
      const isStaffLogin = pathname.includes('staff-login');
      
      // Определяем роль и цель
      const userRole = isStaff || isStaffLogin ? "admin" : "member";
      const targetUrl = savedTarget || (isStaff || isStaffLogin ? '/admin' : '/member-dashboard');
      
      // СРАЗУ показываем loader
      showLoader("login", {
        userRole: userRole,
        userName: "Авторизация через Google",
        dashboardUrl: targetUrl
      });
      
      // Устанавливаем флаг что мы в процессе
      setIsProcessing(true);
    }
  }, [searchParams, pathname, showLoader]);

  // Обработка завершения авторизации
  useEffect(() => {
    if (isProcessing && status === 'authenticated' && session?.user) {
      console.log('✅ Google OAuth успешно завершен, сессия готова');
      
      const targetUrl = sessionStorage.getItem('google_login_target_url') || '/member-dashboard';
      
      // Очищаем флаги
      sessionStorage.removeItem('google_login_in_progress');
      sessionStorage.removeItem('google_login_is_staff');
      sessionStorage.removeItem('google_login_target_url');
      
      // Небольшая задержка для плавности анимации
      setTimeout(() => {
        console.log('🚀 Redirecting to:', targetUrl);
        window.location.replace(targetUrl);
      }, 1000);
    }
  }, [status, session, isProcessing]);

  // НОВОЕ: Рендерим loader если он активен
  if (loaderType === "login" && loaderProps) {
    return (
      <StaffLoginLoader
        userRole={loaderProps.userRole || "member"}
        userName={loaderProps.userName || "Пользователь"}
        dashboardUrl={loaderProps.dashboardUrl || "/"}
      />
    );
  }

  return null;
}