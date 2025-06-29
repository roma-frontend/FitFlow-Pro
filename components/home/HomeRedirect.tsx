// components/home/HomeRedirect.tsx
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function HomeRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Редирект только для staff пользователей
      if (['super-admin', 'admin', 'manager', 'trainer'].includes(user.role)) {
        const dashboardUrl = getDashboardUrl(user.role);
        router.replace(dashboardUrl);
      }
    }
  }, [user, loading, router]);

  const getDashboardUrl = (role: string): string => {
    switch (role) {
      case 'super-admin':
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager-dashboard';
      case 'trainer':
        return '/trainer-dashboard';
      default:
        return '/';
    }
  };

  return null;
}