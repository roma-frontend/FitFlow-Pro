// components/AccessNotification.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useRouter } from 'next/navigation';

interface AccessNotificationProps {
  userRole: string;
  currentPage: string;
}

export default function AccessNotification({ userRole, currentPage }: AccessNotificationProps) {
  const router = useRouter();

  // Определяем ограничения для каждой роли
  const getAccessRestrictions = (role: string) => {
    switch (role) {
      case 'trainer':
        return {
          restricted: ['shop', 'admin'],
          message: 'Тренеры не имеют доступа к магазину и админ-панели',
          suggestions: [
            { text: 'Управлять клиентами', action: () => router.push('/trainer-dashboard') },
            { text: 'Просмотреть расписание', action: () => router.push('/trainer-dashboard') }
          ]
        };
      case 'member':
        return {
          restricted: ['admin', 'trainer-dashboard', 'manager-dashboard'],
          message: 'Участники имеют доступ только к тренировкам и магазину',
          suggestions: [
            { text: 'Перейти в магазин', action: () => router.push('/shop') },
            { text: 'Мой дашборд', action: () => router.push('/member-dashboard') }
          ]
        };
      default:
        return null;
    }
  };

  const restrictions = getAccessRestrictions(userRole);
  
  if (!restrictions || !restrictions.restricted.includes(currentPage)) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-80">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-3">
            <p className="font-medium">Ограниченный доступ</p>
            <p className="text-sm">{restrictions.message}</p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Доступные действия:</p>
              {restrictions.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={suggestion.action}
                  className="w-full text-left justify-start"
                >
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
