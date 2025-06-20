// app/admin/users/components/tabs/HierarchyTab.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Shield, 
  UserCheck, 
  User, 
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2,
  Settings,
  Database,
  BarChart3,
  Users as UsersIcon
} from "lucide-react";
import { useUsersPage } from '../../providers/UsersPageProvider';
import { 
  permissions, 
  hasPermission, 
  UserRole, 
  Resource, 
  Action 
} from '@/lib/permissions';

export const HierarchyTab = React.memo(() => {
  const { state } = useUsersPage();

  // Определение ролей и их иерархии - ИСПРАВЛЕНО: используем правильные названия ролей
  const roleHierarchy = [
    {
      role: 'super-admin' as UserRole,
      name: 'Супер Администратор',
      icon: Crown,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200',
      level: 1,
      description: 'Полный доступ ко всем функциям системы',
      permissions: [
        'Управление всеми пользователями',
        'Настройка системы',
        'Доступ к базе данных',
        'Управление ролями и правами',
        'Просмотр всей аналитики',
        'Резервное копирование',
        'Управление безопасностью'
      ],
      count: state.users.filter(u => u.role === 'super-admin').length // ИСПРАВЛЕНО
    },
    {
      role: 'admin' as UserRole,
      name: 'Администратор',
      icon: Shield,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      level: 2,
      description: 'Управление пользователями и основными настройками',
      permissions: [
        'Управление пользователями (кроме супер админов)',
        'Просмотр аналитики',
        'Управление контентом',
        'Модерация',
        'Настройка уведомлений',
        'Экспорт данных'
      ],
      count: state.users.filter(u => u.role === 'admin').length // ИСПРАВЛЕНО
    },
    {
      role: 'manager' as UserRole,
      name: 'Менеджер',
      icon: UserCheck,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      level: 3,
      description: 'Управление участниками и тренерами',
      permissions: [
        'Управление участниками и клиентами',
        'Управление тренерами',
        'Просмотр статистики',
        'Создание отчетов',
        'Управление расписанием',
        'Обработка заявок'
      ],
      count: state.users.filter(u => u.role === 'manager').length
    },
    {
      role: 'trainer' as UserRole,
      name: 'Тренер',
      icon: User,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      level: 4,
      description: 'Работа с клиентами и ведение тренировок',
      permissions: [
        'Управление своими клиентами',
        'Ведение расписания',
        'Создание программ тренировок',
        'Просмотр своей статистики',
        'Обновление профиля',
        'Общение с клиентами'
      ],
      count: state.users.filter(u => u.role === 'trainer').length
    },
    {
      role: 'member' as UserRole,
      name: 'Участник',
      icon: User,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      level: 5,
      description: 'Базовый доступ к функциям участника',
      permissions: [
        'Просмотр своего профиля',
        'Запись на тренировки',
        'Просмотр расписания',
        'Общение с тренером',
        'Просмотр своей статистики',
        'Обновление личных данных'
      ],
      count: state.users.filter(u => u.role === 'member').length
    },
    {
      role: 'client' as UserRole,
      name: 'Клиент',
      icon: UsersIcon,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      level: 6,
      description: 'Клиентский доступ к услугам',
      permissions: [
        'Просмотр своего профиля',
        'Бронирование услуг',
        'Просмотр истории заказов',
        'Общение с поддержкой',
        'Оплата услуг',
        'Получение уведомлений'
      ],
      count: state.users.filter(u => u.role === 'client').length
    }
  ];

    // Матрица прав доступа
    const permissionMatrix = [
        {
            category: 'Управление пользователями',
            icon: UserCheck,
            permissions: [
                { name: 'Создание пользователей', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false },
                { name: 'Редактирование пользователей', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false },
                { name: 'Удаление пользователей', 'super-admin': true, admin: true, manager: false, trainer: false, member: false, client: false },
                { name: 'Изменение ролей', 'super-admin': true, admin: false, manager: false, trainer: false, member: false, client: false },
                { name: 'Массовые операции', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false }
            ]
        },
        {
            category: 'Система и настройки',
            icon: Settings,
            permissions: [
                { name: 'Настройки системы', 'super-admin': true, admin: false, manager: false, trainer: false, member: false, client: false },
                { name: 'Управление безопасностью', 'super-admin': true, admin: false, manager: false, trainer: false, member: false, client: false },
                { name: 'Резервное копирование', 'super-admin': true, admin: false, manager: false, trainer: false, member: false, client: false },
                { name: 'Логи системы', 'super-admin': true, admin: true, manager: false, trainer: false, member: false, client: false }
            ]
        },
        {
            category: 'Данные и аналитика',
            icon: BarChart3,
            permissions: [
                { name: 'Полная аналитика', 'super-admin': true, admin: true, manager: false, trainer: false, member: false, client: false },
                { name: 'Статистика пользователей', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false },
                { name: 'Экспорт данных', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false },
                { name: 'Личная статистика', 'super-admin': true, admin: true, manager: true, trainer: true, member: true, client: true }
            ]
        },
        {
            category: 'Контент и модерация',
            icon: Eye,
            permissions: [
                { name: 'Модерация контента', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false },
                { name: 'Управление объявлениями', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false },
                { name: 'Отправка уведомлений', 'super-admin': true, admin: true, manager: true, trainer: false, member: false, client: false }
            ]
        },
        {
            category: 'Клиентская работа',
            icon: UsersIcon,
            permissions: [
                { name: 'Работа с клиентами', 'super-admin': true, admin: true, manager: true, trainer: true, member: false, client: false },
                { name: 'Просмотр заказов', 'super-admin': true, admin: true, manager: true, trainer: true, member: false, client: true },
                { name: 'Создание программ', 'super-admin': true, admin: true, manager: true, trainer: true, member: false, client: false },
                { name: 'Бронирование услуг', 'super-admin': true, admin: true, manager: true, trainer: false, member: true, client: true }
            ]
        }
    ];

    const getRoleIcon = (role: string) => {
        const roleData = roleHierarchy.find(r => r.role === role);
        return roleData ? roleData.icon : User;
    };

    const hasPermission = (permission: any, role: string): boolean => {
        return permission[role as keyof typeof permission] === true;
    };

    return (
        <div className="space-y-8">
            {/* Иерархия ролей */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        Иерархия ролей
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {roleHierarchy.map((role, index) => {
                            const Icon = role.icon;
                            return (
                                <div key={role.role} className="relative">
                                    {/* Линия связи */}
                                    {index < roleHierarchy.length - 1 && (
                                        <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-300"></div>
                                    )}

                                    <div className={`p-4 rounded-lg border-2 ${role.borderColor} ${role.bgColor} transition-all duration-200 hover:shadow-md`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${role.color} text-white`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {role.name}
                                                        </h3>
                                                        <Badge className={`${role.textColor} ${role.bgColor}`}>
                                                            Уровень {role.level}
                                                        </Badge>
                                                        <Badge variant="destructive">
                                                            {role.count} пользователей
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-600 mb-3">{role.description}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.permissions.slice(0, 3).map((permission, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {permission}
                                                            </Badge>
                                                        ))}
                                                        {role.permissions.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{role.permissions.length - 3} еще
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {index < roleHierarchy.length - 1 && (
                                                <ChevronDown className="h-5 w-5 text-gray-400 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Матрица прав доступа */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Матрица прав доступа
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {permissionMatrix.map((category, categoryIndex) => {
                            const CategoryIcon = category.icon;
                            return (
                                <div key={categoryIndex} className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <CategoryIcon className="h-5 w-5" />
                                        {category.category}
                                    </h3>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                        Разрешение
                                                    </th>
                                                    {roleHierarchy.map(role => {
                                                        const Icon = getRoleIcon(role.role);
                                                        return (
                                                            <th key={role.role} className="text-center py-3 px-4">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <Icon className="h-4 w-4" />
                                                                    <span className="text-xs font-medium">{role.name}</span>
                                                                </div>
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {category.permissions.map((permission, permIndex) => (
                                                    <tr key={permIndex} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-sm text-gray-700">
                                                            {permission.name}
                                                        </td>
                                                        {roleHierarchy.map(role => (
                                                            <td key={role.role} className="py-3 px-4 text-center">
                                                                {hasPermission(permission, role.role) ? (
                                                                    <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                                                                        <Unlock className="h-3 w-3 text-green-600" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="inline-flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                                                                        <Lock className="h-3 w-3 text-red-600" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Статистика по ролям */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle>Распределение пользователей по ролям</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {roleHierarchy.map(role => {
                            const Icon = role.icon;
                            const percentage = state.users.length > 0 ? (role.count / state.users.length) * 100 : 0;

                            return (
                                <div key={role.role} className={`p-4 rounded-lg ${role.bgColor} border ${role.borderColor}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded ${role.color} text-white`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-lg font-bold text-gray-900">{role.count}</div>
                                            <div className="text-xs text-gray-600">{role.name}</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${role.color}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {percentage.toFixed(1)}% от общего
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Легенда */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle>Обозначения</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Права доступа:</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                                        <Unlock className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-700">Разрешено</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                                        <Lock className="h-3 w-3 text-red-600" />
                                    </div>
                                    <span className="text-sm text-gray-700">Запрещено</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Иерархия:</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Более высокие роли имеют все права нижестоящих ролей</p>
                                <p>• Супер админ может управлять всеми пользователями</p>
                                <p>• Админ не может управлять супер админами</p>
                                <p>• Менеджер может управлять тренерами, участниками и клиентами</p>
                                <p>• Клиенты имеют ограниченный доступ к функциям</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

HierarchyTab.displayName = 'HierarchyTab';

