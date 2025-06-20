// components/admin/users/RoleHierarchy.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Shield, Settings, Dumbbell, User, ArrowDown } from "lucide-react";

export function RoleHierarchy() {
  const roles = [
    {
      name: 'Супер Администратор',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      permissions: ['Полный доступ ко всем функциям', 'Управление всеми ролями кроме других супер-админов', 'Системные настройки']
    },
    {
            name: 'Администратор',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      permissions: ['Создание менеджеров, тренеров и участников', 'Управление контентом', 'Просмотр аналитики']
    },
    {
      name: 'Менеджер',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      permissions: ['Создание тренеров и участников', 'Управление расписанием', 'Отчеты по подразделению']
    },
    {
      name: 'Тренер',
      icon: Dumbbell,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      permissions: ['Создание участников', 'Ведение тренировок', 'Работа с клиентами']
    },
    {
      name: 'Участник',
      icon: User,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      permissions: ['Просмотр своего профиля', 'Запись на тренировки', 'Базовые функции']
    }
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Иерархия ролей и права доступа
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div key={role.name} className="relative">
                <div className={`${role.bgColor} ${role.borderColor} border-l-4 rounded-lg p-4`}>
                  <div className="flex items-start gap-4">
                    <div className={`${role.bgColor} p-2 rounded-lg border ${role.borderColor}`}>
                      <Icon className={`h-5 w-5 ${role.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${role.color} mb-2`}>{role.name}</h3>
                      <ul className="space-y-1">
                        {role.permissions.map((permission, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                {index < roles.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

