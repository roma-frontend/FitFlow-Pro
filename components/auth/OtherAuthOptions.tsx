// components/auth/OtherAuthOptions.tsx
"use client";

import { memo, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLoginButton } from './GoogleLoginButton';
import { Eye, CheckCircle } from 'lucide-react';
import { useFaceIdSmart } from '@/hooks/useFaceIdSmart';
import { cn } from '@/lib/utils';

interface OtherAuthOptionsProps {
  loading: boolean;
}

export const OtherAuthOptions = memo(function OtherAuthOptions({ loading }: OtherAuthOptionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  
  const { 
    isFaceIdRegistered, 
    checkFaceIdStatus,
    profiles 
  } = useFaceIdSmart();

  const [faceIdChecked, setFaceIdChecked] = useState(false);

  // Проверяем статус Face ID при монтировании
  useEffect(() => {
    const checkStatus = async () => {
      await checkFaceIdStatus();
      setFaceIdChecked(true);
    };
    checkStatus();
  }, []);

  const handleFaceIdClick = () => {
    const faceAuthUrl = redirectParam
      ? `/auth/face-auth?redirect=${encodeURIComponent(redirectParam)}`
      : '/auth/face-auth';
    router.push(faceAuthUrl);
  };

  const handleStaffLogin = () => {
    const staffLoginUrl = redirectParam
      ? `/staff-login?redirect=${encodeURIComponent(redirectParam)}`
      : '/staff-login';
    router.push(staffLoginUrl);
  };

  return (
    <div className="pt-6 border-t border-gray-200">
      <div className="text-center space-y-3">
        <p className="text-xs text-gray-500">Другие варианты входа</p>
        <div className="space-y-2">
          {/* Google вход */}
          <GoogleLoginButton 
            isStaff={false} 
            disabled={loading} 
            className='rounded-lg text-sm'
          />

          {/* Face ID вход с индикатором статуса */}
          <Button
            variant="outline"
            onClick={handleFaceIdClick}
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg transition-all relative",
              "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              isFaceIdRegistered && faceIdChecked && "border-green-300 hover:border-green-400"
            )}
          >
            <Eye className="h-5 w-5" />
            <span className="font-medium">Face ID вход</span>
            
            {/* Индикатор активного Face ID */}
            {faceIdChecked && isFaceIdRegistered && (
              <div className="absolute -top-1 -right-1 flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                  <div className="relative bg-green-500 rounded-full p-0.5">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Количество профилей */}
            {faceIdChecked && isFaceIdRegistered && profiles.length > 0 && (
              <span className="absolute -bottom-1 -right-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">
                {profiles.length}
              </span>
            )}
          </Button>

          {/* Подсказка о Face ID */}
          {faceIdChecked && isFaceIdRegistered && (
            <p className="text-xs text-green-600">
              ✓ Face ID настроен и готов к использованию
            </p>
          )}

          {/* Вход для персонала */}
          <Button
            variant="outline"
            onClick={handleStaffLogin}
            className="w-full h-10"
            disabled={loading}
          >
            🛡️ Вход для персонала
          </Button>

          {/* На главную */}
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="w-full h-8 text-xs"
            disabled={loading}
          >
            ← На главную страницу
          </Button>
        </div>
      </div>
    </div>
  );
});