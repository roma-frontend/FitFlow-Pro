// components/face-auth/Header.tsx
"use client";

import React, { memo } from 'react';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HeaderProps } from '@/types/face-auth.types';

const Header = memo(({ mode }: HeaderProps) => {
  const router = useRouter();

  const handleIconClick = () => {
    router.push('/');
  };

  return (
    <div className="text-center mb-12">
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-gray-200/50 p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-center mb-6">
          <div 
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={handleIconClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleIconClick();
              }
            }}
            aria-label="Перейти на главную страницу"
          >
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Advanced Face Recognition
            </h1>
            <p className="text-gray-600 mt-1">
              {mode === "login" ? "Вход в систему" : "Регистрация Face ID"}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200">
          <div className={`w-2 h-2 rounded-full mr-2 ${mode === "login" ? "bg-green-500" : "bg-blue-500"}`}></div>
          <span className="text-sm font-medium text-blue-800">
            Режим: {mode === "login" ? "Аутентификация" : "Регистрация"}
          </span>
        </div>
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
