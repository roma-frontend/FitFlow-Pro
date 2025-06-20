"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Users,
  Zap,
  Shield,
  Database,
  BarChart3,
  Download,
  Code,
  Activity,
  UserCheck,
  Cog,
  ShieldCheck,
  FileText,
  Wrench,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AuthStatus } from "@/types/home";
import { isAdmin, isSuperAdmin } from "@/utils/roleHelpers";
import { useApi } from "@/hooks/useApi"; // Используем обновленный useApi

interface DeveloperPanelProps {
  authStatus: AuthStatus | null;
}

export default function DeveloperPanel({ authStatus }: DeveloperPanelProps) {
  const router = useRouter();
  const { post, loading, showInfo } = useApi(); // Используем showInfo из useApi

  // Показываем только админам и супер-админам
  if (!isAdmin(authStatus)) {
    return null;
  }

  const handleQuickSetup = async () => {
    showInfo('Запуск', 'Начинаем автоматическую настройку системы...');
    
    // Последовательно выполняем настройку
    const steps = [
      { url: '/api/setup/users', message: 'Создание пользователей...' },
      { url: '/api/setup/demo-data', message: 'Добавление демо-данных...' },
      { url: '/api/setup/verify', message: 'Проверка системы...' }
    ];

    for (const step of steps) {
      showInfo('Настройка', step.message);
      await post(step.url, {}, { 
        showSuccessToast: false, 
        showErrorToast: true 
      });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Пауза между шагами
    }

    showInfo('Завершено', 'Автоматическая настройка завершена!');
    setTimeout(() => router.push('/admin'), 2000);
  };

  // ... остальной код остается тем же
  return (
    <Card className="mb-16 border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
      {/* ... весь остальной JSX код остается тем же ... */}
    </Card>
  );
}
