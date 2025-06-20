// app/admin/password-reset/page.tsx (финальная версия)
import { PasswordResetManagement } from '@/components/admin/PasswordResetManagement';
import { PasswordResetTester } from '@/components/dev/PasswordResetTester';

export default function PasswordResetPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Тестер только в режиме разработки */}
      {process.env.NODE_ENV === 'development' && <PasswordResetTester />}
      
      {/* Основной компонент управления */}
      <PasswordResetManagement />
    </div>
  );
}
