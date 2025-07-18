// app/test-face-id/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FaceIdStatusCheck from './FaceIdStatusCheck';

export default function TestFaceIdPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/member-dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад в личный кабинет
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Проверка Face ID
          </h1>
          <p className="mt-2 text-gray-600">
            Проверьте статус регистрации Face ID в системе
          </p>
        </div>
        
        <FaceIdStatusCheck />
        
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-600">
            Для работы Face ID необходимо:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
            <li>✅ Войти в систему с помощью email и пароля</li>
            <li>✅ Зарегистрировать Face ID в системе</li>
            <li>✅ Дождаться синхронизации с базой данных</li>
          </ul>
        </div>
      </div>
    </div>
  );
}