// app/admin/password-reset/page.tsx
"use client";

import { Suspense } from 'react';
import { PasswordResetManagement } from '@/components/admin/PasswordResetManagement';
import { PasswordResetTester } from '@/components/dev/PasswordResetTester';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Компонент загрузки
function LoadingFallback() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Загрузка управления паролями...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Тестер только в режиме разработки */}
        {process.env.NODE_ENV === 'development' && (
          <Suspense fallback={<div>Загрузка тестера...</div>}>
            <PasswordResetTester />
          </Suspense>
        )}
        
        {/* Основной компонент управления */}
        <PasswordResetManagement />
      </div>
    </Suspense>
  );
}
