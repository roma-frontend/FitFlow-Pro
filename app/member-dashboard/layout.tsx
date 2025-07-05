"use client";

import { useLoaderStore } from "@/stores/loaderStore";
import { useEffect } from "react";

// app/member-dashboard/layout.tsx
export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const hideLoader = useLoaderStore((state) => state.hideLoader);

  useEffect(() => {
    // Очищаем loader и флаги при загрузке страницы
    hideLoader();
    sessionStorage.removeItem('is_redirecting');
    
    // Показываем приветственное сообщение если нужно
    const showWelcome = sessionStorage.getItem('show_welcome_toast');
    const userRole = sessionStorage.getItem('welcome_user_role');
    
    if (showWelcome === 'true') {
      sessionStorage.removeItem('show_welcome_toast');
      sessionStorage.removeItem('welcome_user_role');
    }
  }, [hideLoader]);

  return <>{children}</>;
}
