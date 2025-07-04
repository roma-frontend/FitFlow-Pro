// app/admin/users/components/UserGrid.tsx (ОБНОВЛЕННАЯ ВЕРСИЯ)
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  Crown,
  Shield,
  User as UserIcon,
  Clock,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/user";
import { useUsersPage } from '../providers/UsersPageProvider';
import { UserAvatar } from './UserAvatar';
import { UserDetailsModal } from '@/components/admin/users/UserDetailsModal';

interface UserGridProps {
  users: User[];
}

export const UserGrid = React.memo<UserGridProps>(({ users }) => {
  const { state, permissions, actions } = useUsersPage();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoadingMembership, setIsLoadingMembership] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Загружаем данные при выборе пользователя
  useEffect(() => {
    if (selectedUser && showDetailsModal) {
      // Загружаем данные абонемента
      const loadMembership = async () => {
        setIsLoadingMembership(true);
        try {
          const response = await fetch(`/api/memberships/user/${selectedUser.id}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentMembership(data.membership);
          }
        } catch (error) {
          console.error('Ошибка загрузки абонемента:', error);
        } finally {
          setIsLoadingMembership(false);
        }
      };

      // Загружаем статистику
      const loadStats = async () => {
        setIsLoadingStats(true);
        try {
          const response = await fetch(`/api/users/${selectedUser.id}/stats`);
          if (response.ok) {
            const data = await response.json();
            setUserStats(data.stats);
          }
        } catch (error) {
          console.error('Ошибка загрузки статистики:', error);
        } finally {
          setIsLoadingStats(false);
        }
      };

      loadMembership();
      loadStats();
    }
  }, [selectedUser, showDetailsModal]);

  // Мемоизированные иконки ролей
  const roleIcons = useMemo(() => ({
    'super-admin': Crown,
    admin: Shield,
    manager: UserCheck,
    trainer: UserIcon,
    member: UserIcon,
    client: UserIcon
  }), []);

  const roleColors = useMemo(() => ({
    'super-admin': 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    trainer: 'bg-green-100 text-green-800',
    member: 'bg-gray-100 text-gray-800',
    client: 'bg-orange-100 text-orange-800'
  }), []);

  const roleLabels = useMemo(() => ({
    'super-admin': 'Супер админ',
    admin: 'Администратор',
    manager: 'Менеджер',
    trainer: 'Тренер',
    member: 'Участник',
    client: 'Клиент'
  }), []);

  // Форматирование даты
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatLastLogin = (timestamp?: number) => {
    if (!timestamp) return 'Никогда';
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
    return formatDate(timestamp);
  };

  // Функция для открытия деталей пользователя
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    // Сбрасываем предыдущие данные
    setCurrentMembership(null);
    setUserStats(null);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
    setCurrentMembership(null);
    setUserStats(null);
  };

  // ✅ Мемоизированная проверка выбранных пользователей
  const selectedUsersArray = useMemo(() => 
    Array.from(state.selectedUsers), 
    [state.selectedUsers]
  );

  if (users.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Пользователи не найдены
        </h3>
        <p className="text-gray-600">
          Попробуйте изменить фильтры или создать нового пользователя
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Заголовок с выбором всех */}
        <div className="flex items-center gap-3 px-4">
          <Checkbox
            checked={state.selectedUsers.size === users.length && users.length > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                actions.selectAllUsers();
              } else {
                actions.clearSelection();
              }
            }}
          />
          <span className="text-sm text-gray-600">
            Выбрать все ({users.length})
          </span>
        </div>

        {/* Сетка пользователей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || UserIcon;
            // ✅ Используем Set.has() вместо Array.includes()
            const isSelected = state.selectedUsers.has(user.id);
            const canEdit = actions.canEditUser(user);

            return (
              <Card 
                key={user.id} 
                className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  {/* Заголовок карточки */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => actions.toggleUserSelection(user.id)}
                      />
                      <UserAvatar 
                        photoUrl={user.photoUrl} 
                        name={user.name} 
                        size="md" 
                      />
                    </div>

                    {/* Меню действий */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Новый пункт для просмотра деталей */}
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Подробная информация
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {canEdit && permissions.canUpdate && (
                          <DropdownMenuItem
                            onClick={() => {
                              actions.setEditingUser(user);
                              actions.setShowCreateDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                        )}
                        
                        {permissions.canUpdate && (
                          <DropdownMenuItem
                            onClick={() => actions.toggleUserStatus(user.id, !user.isActive)}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Деактивировать
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Активировать
                              </>
                            )}
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => window.open(`mailto:${user.email}`)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Написать email
                        </DropdownMenuItem>

                        {canEdit && permissions.canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => actions.deleteUser(user.id, user.name)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Информация о пользователе */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Роль и статус */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                      </Badge>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>

                    {/* Даты */}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Создан: {formatDate(user.createdAt || 0)}
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Вход: {formatLastLogin(user.lastLogin)}
                        </div>
                      )}
                    </div>

                    {/* Кнопка для просмотра деталей */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleViewDetails(user)}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Модальное окно с деталями пользователя */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        user={selectedUser}
        membership={currentMembership}
        stats={userStats}
        isLoadingMembership={isLoadingMembership}
        isLoadingStats={isLoadingStats}
      />
    </>
  );
});

UserGrid.displayName = 'UserGrid';