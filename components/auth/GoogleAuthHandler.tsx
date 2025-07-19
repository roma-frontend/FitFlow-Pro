// components/auth/GoogleAuthHandler.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useLoaderStore } from '@/stores/loaderStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import StaffLoginLoader from '@/app/staff-login/components/StaffLoginLoader';
import { UserRole } from '@/lib/permissions';

// Утилитная функция для безопасного приведения строки к UserRole
const toUserRole = (role: string | null | undefined): UserRole => {
  const validRoles: UserRole[] = ["super-admin", "admin", "manager", "trainer", "member", "client"];
  if (role && validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  return "member"; // Значение по умолчанию
};

// Внутренний компонент который использует useSearchParams
function GoogleAuthHandlerInner() {
  const { data: session, status } = useSession();
  const { showLoader, loaderType, loaderProps } = useLoaderStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false);

  // Показываем loader сразу при обнаружении возврата от Google
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
      const staffRole = sessionStorage.getItem('google_login_staff_role');
      const isStaffLogin = pathname.includes('staff-login');
      
      // Определяем роль и цель
      const userRole = isStaff || isStaffLogin ? toUserRole(staffRole) || "admin" : "member";
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
      sessionStorage.removeItem('google_login_staff_role');
      sessionStorage.removeItem('is_redirecting');
      
      // Небольшая задержка для плавности анимации
      setTimeout(() => {
        console.log('🚀 Redirecting to:', targetUrl);
        window.location.replace(targetUrl);
      }, 1000);
    }
  }, [status, session, isProcessing]);

  // Рендерим loader если он активен
  if (loaderType === "login" && loaderProps) {
    return (
      <StaffLoginLoader
        userRole={loaderProps.userRole || "member"}
        userName={loaderProps.userName || "Пользователь"}
        dashboardUrl={loaderProps.dashboardUrl || "/"}
        isOpen={true}
      />
    );
  }

  return null;
}

// Основной компонент с Suspense
export function GoogleAuthHandler() {
  // Не рендерим ничего если мы на клиенте и нет признаков OAuth
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.get('code') && urlParams.get('state');
    const googleInProgress = sessionStorage.getItem('google_login_in_progress') === 'true';
    
    // Если нет признаков OAuth процесса, не рендерим компонент
    if (!hasOAuthParams && !googleInProgress) {
      return null;
    }
  }
  
  return (
    <Suspense fallback={null}>
      <GoogleAuthHandlerInner />
    </Suspense>
  );
}