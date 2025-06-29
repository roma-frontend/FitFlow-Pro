// components/member/QuickActions.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  QrCode,
  CreditCard,
  User,
  Users,
  Settings,
  Receipt,
  ShoppingBag
} from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  bgColor: string;
  badge?: string;
  priority: number;
}

interface QuickActionsProps {
  stats?: {
    upcoming: number;
    completed: number;
    totalHours: number;
    daysLeft: number;
  };
  customActions?: QuickAction[];
}

export default function QuickActions({ 
  stats = { upcoming: 0, completed: 0, totalHours: 0, daysLeft: 15 },
  customActions = []
}: QuickActionsProps) {

  const router = useRouter()
  
  const defaultActions: QuickAction[] = [
    {
      id: 'book-trainer',
      title: 'Записаться к тренеру',
      description: 'Персональная тренировка',
      icon: User,
      href: '/trainers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      priority: 1
    },
    {
      id: 'join-program',
      title: 'Групповая программа',
      description: 'Йога, кардио, силовые',
      icon: Users,
      href: '/programs',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      priority: 2
    },
    {
      id: 'my-bookings',
      title: 'Мои записи',
      description: 'Управление тренировками',
      icon: Calendar,
      href: '/member-dashboard/my-bookings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      badge: stats.upcoming > 0 ? stats.upcoming.toString() : undefined,
      priority: 3
    },
    {
      id: 'qr-code',
      title: 'QR-код входа',
      description: 'Быстрый доступ в зал',
      icon: QrCode,
      href: '/qr-code',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      priority: 4
    },
    {
      id: 'shop',
      title: 'Магазин',
      description: 'Спортивное питание',
      icon: ShoppingBag,
      href: '/shop',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      priority: 5
    },
    {
      id: 'orders-history',
      title: 'История заказов',
      description: 'Чеки и покупки',
      icon: Receipt,
      href: '/member-dashboard/orders',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      priority: 6
    },
    {
      id: 'memberships',
      title: 'Абонементы',
      description: 'Продлить или купить',
      icon: CreditCard,
      href: '/memberships',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      badge: stats.daysLeft <= 7 ? 'Скоро истекает' : undefined,
      priority: 7
    },
    {
      id: 'profile',
      title: 'Профиль',
      description: 'Настройки аккаунта',
      icon: Settings,
      href: '/profile',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      priority: 8
    }
  ];

  const allActions = [...customActions, ...defaultActions]
    .sort((a, b) => a.priority - b.priority);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {allActions.map((action) => {
        const IconComponent = action.icon;
        
        return (
          <Card
            key={action.id}
            className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-0 shadow-md"
            onClick={() => router.push(action.href)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 ${action.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110`}>
                <IconComponent className={`h-6 w-6 ${action.color}`} />
              </div>
              
              <div className="relative">
                <h3 className="text-sm font-semibold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {action.title}
                </h3>
                
                {action.badge && (
                  <Badge 
                    className={`absolute -top-6 -right-2 text-xs ${
                      action.badge === 'Скоро истекает' 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-gray-600 leading-tight">
                {action.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
