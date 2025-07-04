// app/admin/users/components/LazyUserGrid.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/types/user';
import { useUsersPage } from '../providers/UsersPageProvider';
import { Loader2 } from 'lucide-react';
import { UserCard } from '@/components/admin/users/UserCard';
import { UserDetailsModal } from '@/components/admin/users/UserDetailsModal';

interface LazyUserGridProps {
  users: User[];
}

const BATCH_SIZE = 20; // Количество карточек для загрузки за раз

export const LazyUserGrid = React.memo<LazyUserGridProps>(({ users }) => {
  const { state, permissions, actions } = useUsersPage();
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [membershipData, setMembershipData] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Обработчик просмотра деталей
  const handleViewDetails = useCallback(async (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setIsLoadingDetails(true);
    
    // Параллельная загрузка данных
    try {
      const [membershipRes, statsRes] = await Promise.all([
        fetch(`/api/memberships/user/${user.id}`),
        fetch(`/api/users/${user.id}/stats`)
      ]);
      
      const [membershipData, statsData] = await Promise.all([
        membershipRes.json(),
        statsRes.json()
      ]);
      
      setMembershipData(membershipData.membership);
      setStatsData(statsData.stats);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < users.length) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, users.length));
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [visibleCount, users.length]);

  // Мемоизированные обработчики
  const handleEdit = useCallback(async (id: string, name: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      actions.setEditingUser(user);
      actions.setShowCreateDialog(true);
    }
  }, [users, actions]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    await actions.deleteUser(id, name);
  }, [actions]);

  const handleToggleStatus = useCallback(async (id: string, isActive: boolean) => {
    await actions.toggleUserStatus(id, isActive);
  }, [actions]);

  const visibleUsers = users.slice(0, visibleCount);

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Пользователи не найдены</h3>
        <p className="text-gray-500">Попробуйте изменить фильтры или добавить нового пользователя</p>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="space-y-6">
        {/* Статистика загрузки */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Показано {visibleCount} из {users.length} пользователей
          </p>
          {visibleCount < users.length && (
            <p className="text-xs text-gray-500">
              Прокрутите вниз для загрузки остальных
            </p>
          )}
        </div>

        {/* Сетка пользователей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserRole={state.userRole}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Индикатор загрузки */}
        {visibleCount < users.length && (
          <div 
            ref={loaderRef} 
            className="flex items-center justify-center py-8"
          >
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Загрузка пользователей...</span>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно деталей */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
          setMembershipData(null);
          setStatsData(null);
        }}
        user={selectedUser}
        membership={membershipData}
        stats={statsData}
        isLoadingMembership={isLoadingDetails}
        isLoadingStats={isLoadingDetails}
      />
    </>
  );
});

LazyUserGrid.displayName = 'LazyUserGrid';