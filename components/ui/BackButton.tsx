// components/ui/BackButton.tsx
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function BackButton({ className, children }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Проверяем, есть ли история
    if (window.history.length > 1) {
      router.back();
    } else {
      // Если истории нет, идем на главную
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={className || "flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"}
    >
      <ArrowLeft className="h-5 w-5" />
      {children || 'Вернуться назад'}
    </button>
  );
}