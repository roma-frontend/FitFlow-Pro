// hooks/useUsers.ts - СТАБИЛЬНАЯ ВЕРСИЯ
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  createdAt?: string;
  isActive?: boolean;
  photoUrl?: string | null;
  lastLogin?: string | null;
}

// Ключи для React Query
const QUERY_KEYS = {
  users: ['users'] as const,
  stats: ['users', 'stats'] as const,
  user: (id: string) => ['users', id] as const,
};

export function useUsers() {
  const queryClient = useQueryClient();

  // Основной запрос пользователей с отключенным кэшированием
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch: refetchUsers
  } = useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: async () => {
      console.log('🔍 useUsers: загружаем пользователей...');
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.error('❌ HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Данные получены:', data.success ? 'успешно' : 'с ошибкой');
      
      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
      
      return data;
    },
    staleTime: 0, // Данные сразу считаются устаревшими
    gcTime: 0, // Не храним в кэше
    retry: (failureCount, error) => {
      console.log(`🔄 Попытка ${failureCount + 1}, ошибка:`, error.message);
      return failureCount < 2; // Максимум 3 попытки
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Запрос статистики
  const {
    data: statsResponse,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      const response = await fetch('/api/admin/users/stats', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.success ? data : null;
    },
    staleTime: 0,
    gcTime: 30 * 1000, // 30 секунд для статистики
    retry: false,
  });

  // Мутация создания пользователя
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      console.log('➕ useUsers: создаем пользователя:', userData);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка создания пользователя');
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('✅ useUsers: пользователь создан, принудительно обновляем данные');
      // Принудительно перезагружаем данные
      queryClient.removeQueries({ queryKey: QUERY_KEYS.users });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.stats });
      refetchUsers();
      refetchStats();
    },
    onError: (error) => {
      console.error('💥 useUsers: ошибка создания:', error);
    }
  });

  // Мутация обновления пользователя
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('🔄 useUsers: обновляем пользователя:', id, updates);
      
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка обновления пользователя');
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('✅ useUsers: пользователь обновлен, принудительно обновляем данные');
      // Принудительно перезагружаем данные
      queryClient.removeQueries({ queryKey: QUERY_KEYS.users });
      refetchUsers();
    },
    onError: (error) => {
      console.error('💥 useUsers: ошибка обновления:', error);
    }
  });

  // Мутация удаления пользователя
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ useUsers: удаляем пользователя:', id);
      
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка удаления пользователя');
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('✅ useUsers: пользователь удален, принудительно обновляем данные');
      // Принудительно перезагружаем данные
      queryClient.removeQueries({ queryKey: QUERY_KEYS.users });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.stats });
      refetchUsers();
      refetchStats();
    },
    onError: (error) => {
      console.error('💥 useUsers: ошибка удаления:', error);
    }
  });

  return {
    // Данные
    users: usersResponse?.users || [],
    stats: statsResponse?.stats || null,
    meta: usersResponse?.meta || null,
    
    // Состояния загрузки
    isLoading,
    statsLoading,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    
    // Ошибки
    error: error?.message || null,
    createError: createUserMutation.error?.message || null,
    updateError: updateUserMutation.error?.message || null,
    deleteError: deleteUserMutation.error?.message || null,
    
    // Действия
    createUser: createUserMutation.mutate,
    updateUser: (id: string, updates: any) => 
      updateUserMutation.mutate({ id, updates }),
    deleteUser: deleteUserMutation.mutate,
    
    // Утилиты
    refetch: refetchUsers,
    refetchStats,
    
    // Сброс ошибок
    clearErrors: () => {
      createUserMutation.reset();
      updateUserMutation.reset();
      deleteUserMutation.reset();
    },
    
    // Права доступа
    canCreate: usersResponse?.canCreate || false,
    userRole: usersResponse?.userRole || 'client',
    
    // Дополнительные данные
    trainers: usersResponse?.trainers || null,
  };
}
