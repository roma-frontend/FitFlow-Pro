// app/auth/face-auth/page.tsx - ИСПРАВЛЕННАЯ версия
"use client";

import FaceAuthOptimized from "@/components/auth/face-auth/FaceAuthOptimized";
import MainHeader from "@/components/MainHeader";
import { useAuth } from "@/hooks/useAuth";
import { SwitchModeType } from "@/types/face-auth.types";

export default function FaceAuthPage() {

  const { authStatus, loading, logout, refreshUser  } = useAuth();

  const handleSuccess = async (userData: any) => {
    console.log('Успешная аутентификация:', userData);
    
    // ✅ Обновляем состояние пользователя после успешной аутентификации
    await refreshUser();
    
    // ✅ Можно перенаправить пользователя
    // router.push('/dashboard');
  };

  const handleSwitchMode = (mode: SwitchModeType) => {
    console.log('Переключение режима:', mode);
  };

  return (
    <>
      <MainHeader
      />
      <FaceAuthOptimized
        mode="login"
        onSuccess={handleSuccess}
        viewMode="modern"
        onSwitchMode={handleSwitchMode}
      />
    </>
  );
}
