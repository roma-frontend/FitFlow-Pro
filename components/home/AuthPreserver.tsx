// components/home/AuthPreserver.tsx
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthPreserver() {
  const { user, token, refreshUser } = useAuth();

  useEffect(() => {
    // При монтировании компонента проверяем localStorage
    const checkStoredAuth = async () => {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      
      console.log('🏠 AuthPreserver: проверка сохраненной авторизации', {
        hasStoredUser: !!storedUser,
        hasStoredToken: !!storedToken,
        hasContextUser: !!user,
        hasContextToken: !!token
      });

      // Если есть сохраненные данные, но нет в контексте - обновляем
      if (storedUser && storedToken && !user) {
        console.log('🔄 AuthPreserver: восстанавливаем авторизацию из localStorage');
        await refreshUser();
      }
    };

    checkStoredAuth();
  }, []); // Только при монтировании

  // Следим за изменениями user и сохраняем в localStorage
  useEffect(() => {
    if (user && token) {
      console.log('💾 AuthPreserver: сохраняем данные пользователя');
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_token', token);
    }
  }, [user, token]);

  // Дополнительная проверка при фокусе окна
  useEffect(() => {
    const handleFocus = () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedToken && storedUser && !user) {
        console.log('🔄 AuthPreserver: окно получило фокус, проверяем авторизацию');
        refreshUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, refreshUser]);

  // Синхронизация между вкладками
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'auth_user') {
        console.log('🔄 AuthPreserver: изменение в localStorage, обновляем состояние');
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUser]);

  return null; // Компонент не рендерит ничего
}