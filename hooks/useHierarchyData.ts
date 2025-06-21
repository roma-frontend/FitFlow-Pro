// app/admin/users/components/tabs/useHierarchyData.ts
import { useUsersPage } from "@/app/admin/users/providers/UsersPageProvider";
import { UserRole } from "@/lib/permissions";
import { 
  Crown, Shield, UserCheck, User, Users as UsersIcon, 
  Settings,
  BarChart3,
  Eye
} from "lucide-react";

export const useHierarchyData = () => {
  const { state } = useUsersPage();

  const roleHierarchy = [
    {
      role: "super-admin" as UserRole,
      name: "Супер Администратор",
      icon: Crown,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      level: 1,
      description: "Полный доступ ко всем функциям системы",
      permissions: [
        "Управление всеми пользователями",
        "Настройка системы",
        "Доступ к базе данных",
        "Управление ролями и правами",
        "Просмотр всей аналитики",
        "Резервное копирование",
        "Управление безопасностью",
      ],
      count: state.users.filter((u) => u.role === "super-admin").length, // ИСПРАВЛЕНО
    },
    {
      role: "admin" as UserRole,
      name: "Администратор",
      icon: Shield,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      level: 2,
      description: "Управление пользователями и основными настройками",
      permissions: [
        "Управление пользователями (кроме супер админов)",
        "Просмотр аналитики",
        "Управление контентом",
        "Модерация",
        "Настройка уведомлений",
        "Экспорт данных",
      ],
      count: state.users.filter((u) => u.role === "admin").length, // ИСПРАВЛЕНО
    },
    {
      role: "manager" as UserRole,
      name: "Менеджер",
      icon: UserCheck,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      level: 3,
      description: "Управление участниками и тренерами",
      permissions: [
        "Управление участниками и клиентами",
        "Управление тренерами",
        "Просмотр статистики",
        "Создание отчетов",
        "Управление расписанием",
        "Обработка заявок",
      ],
      count: state.users.filter((u) => u.role === "manager").length,
    },
    {
      role: "trainer" as UserRole,
      name: "Тренер",
      icon: User,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      level: 4,
      description: "Работа с клиентами и ведение тренировок",
      permissions: [
        "Управление своими клиентами",
        "Ведение расписания",
        "Создание программ тренировок",
        "Просмотр своей статистики",
        "Обновление профиля",
        "Общение с клиентами",
      ],
      count: state.users.filter((u) => u.role === "trainer").length,
    },
    {
      role: "member" as UserRole,
      name: "Участник",
      icon: User,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
      borderColor: "border-gray-200",
      level: 5,
      description: "Базовый доступ к функциям участника",
      permissions: [
        "Просмотр своего профиля",
        "Запись на тренировки",
        "Просмотр расписания",
        "Общение с тренером",
        "Просмотр своей статистики",
        "Обновление личных данных",
      ],
      count: state.users.filter((u) => u.role === "member").length,
    },
    {
      role: "client" as UserRole,
      name: "Клиент",
      icon: UsersIcon,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-800",
      borderColor: "border-orange-200",
      level: 6,
      description: "Клиентский доступ к услугам",
      permissions: [
        "Просмотр своего профиля",
        "Бронирование услуг",
        "Просмотр истории заказов",
        "Общение с поддержкой",
        "Оплата услуг",
        "Получение уведомлений",
      ],
      count: state.users.filter((u) => u.role === "client").length,
    },
  ];

  // Матрица прав доступа
  const permissionMatrix = [
    {
      category: "Управление пользователями",
      icon: UserCheck,
      permissions: [
        {
          name: "Создание пользователей",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Редактирование пользователей",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Удаление пользователей",
          "super-admin": true,
          admin: true,
          manager: false,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Изменение ролей",
          "super-admin": true,
          admin: false,
          manager: false,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Массовые операции",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
      ],
    },
    {
      category: "Система и настройки",
      icon: Settings,
      permissions: [
        {
          name: "Настройки системы",
          "super-admin": true,
          admin: false,
          manager: false,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Управление безопасностью",
          "super-admin": true,
          admin: false,
          manager: false,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Резервное копирование",
          "super-admin": true,
          admin: false,
          manager: false,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Логи системы",
          "super-admin": true,
          admin: true,
          manager: false,
          trainer: false,
          member: false,
          client: false,
        },
      ],
    },
    {
      category: "Данные и аналитика",
      icon: BarChart3,
      permissions: [
        {
          name: "Полная аналитика",
          "super-admin": true,
          admin: true,
          manager: false,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Статистика пользователей",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Экспорт данных",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Личная статистика",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: true,
          member: true,
          client: true,
        },
      ],
    },
    {
      category: "Контент и модерация",
      icon: Eye,
      permissions: [
        {
          name: "Модерация контента",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Управление объявлениями",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
        {
          name: "Отправка уведомлений",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: false,
          client: false,
        },
      ],
    },
    {
      category: "Клиентская работа",
      icon: UsersIcon,
      permissions: [
        {
          name: "Работа с клиентами",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: true,
          member: false,
          client: false,
        },
        {
          name: "Просмотр заказов",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: true,
          member: false,
          client: true,
        },
        {
          name: "Создание программ",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: true,
          member: false,
          client: false,
        },
        {
          name: "Бронирование услуг",
          "super-admin": true,
          admin: true,
          manager: true,
          trainer: false,
          member: true,
          client: true,
        },
      ],
    },
  ];

  const getRoleIcon = (role: string) => {
    return roleHierarchy.find((r) => r.role === role)?.icon || User;
  };

  const hasPermission = (permission: any, role: string): boolean => {
    return permission[role as keyof typeof permission] === true;
  };

  return {
    roleHierarchy,
    permissionMatrix,
    getRoleIcon,
    hasPermission,
    totalUsers: state.users.length
  };
};