// hooks/use-persistent-auth.ts
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function usePersistentAuth() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Функция для проверки и восстановления авторизации
    const checkAndRestoreAuth = () => {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      
      if (!storedUser || !storedToken) {
        console.log('🔍 PersistentAuth: нет сохраненных данных авторизации');
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        console.log('✅ PersistentAuth: найдены данные пользователя:', {
          email: user.email,
          role: user.role,
          name: user.name
        });

        // Если мы на главной странице и пользователь авторизован - ничего не делаем
        if (pathname === '/') {
          console.log('🏠 PersistentAuth: на главной странице, сохраняем авторизацию');
          return;
        }

        // Проверяем, что куки установлены
        const cookies = document.cookie.split(';');
        const hasAuthToken = cookies.some(c => c.trim().startsWith('auth_token='));
        const hasUserRole = cookies.some(c => c.trim().startsWith('user_role='));
        
        if (!hasAuthToken || !hasUserRole) {
          console.log('⚠️ PersistentAuth: куки отсутствуют, требуется повторный вход');
          // Можно добавить логику для восстановления куки через API
        }

      } catch (error) {
        console.error('❌ PersistentAuth: ошибка парсинга данных пользователя:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    };

    // Проверяем при монтировании и изменении маршрута
    checkAndRestoreAuth();
  }, [pathname]);

  // Функция для явного сохранения состояния
  const preserveAuthState = () => {
    const authToken = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('auth_token='))
      ?.split('=')[1];
      
    if (authToken) {
      console.log('💾 PersistentAuth: сохраняем токен из куки');
      localStorage.setItem('auth_token', authToken);
    }
  };

  return { preserveAuthState };
}