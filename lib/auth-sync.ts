// lib/auth-sync.ts
import { getServerSession } from "next-auth";
import { ConvexHttpClient } from "convex/browser";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { authOptions } from "@/lib/auth"; // ✅ Исправленный импорт

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Определяем тип для пользователя
interface SyncedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function syncAuthWithConvex() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    // Получаем пользователя из Convex
    const user = await convex.query("users:getByEmail", { 
      email: session.user.email 
    });
    
    if (user) {
      // Синхронизируем данные сессии с данными из Convex
      return {
        ...session,
        user: {
          ...session.user,
          id: user._id,
          role: user.role,
          name: user.name || session.user.name,
        }
      };
    }
  }
  
  return session;
}

// Hook для клиентской части
export function useAuthSync() {
  const { data: session, status } = useSession();
  const [syncedUser, setSyncedUser] = useState<SyncedUser | null>(null);
  
  useEffect(() => {
    if (session?.user?.email) {
      // Синхронизируем с localStorage для совместимости
      const userData: SyncedUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role || 'member'
      };
      
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setSyncedUser(userData);
    } else {
      // Очищаем данные при выходе
      setSyncedUser(null);
      localStorage.removeItem('auth_user');
    }
  }, [session]);
  
  return { user: syncedUser, loading: status === "loading" };
}