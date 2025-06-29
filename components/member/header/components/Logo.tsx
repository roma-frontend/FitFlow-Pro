// components/member/header/components/Logo.tsx (обновленная версия с Shield)
import React from 'react';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Logo = React.memo(() => {
  const router = useRouter()

  const handleClick = () => {
  router.push("/")
}
  return (
    <div 
      className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0" 
      onClick={handleClick}
    >
      {/* Иконка Shield как на оригинальном дизайне */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/40 transition-all group">
        <Shield 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" 
          strokeWidth={2.5}
        />
      </div>
      
      {/* Текст логотипа */}
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">
          FitFlow Pro
        </h1>
        <p className="text-xs text-white/80 hidden sm:block lg:text-sm truncate">
          Умная система управления
        </p>
      </div>
    </div>
  );
});

Logo.displayName = 'Logo';
