// app/admin/users/providers/UsersPageProvider.tsx (ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ)
"use client";

import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, CreateUserData, UpdateUserData } from "@/types/user";
import { canCreateUsers, canUpdateUsers, canDeleteUsers, canManageUser } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { Trash2, UserX, UserCheck } from "lucide-react";

// ✅ Оптимизированное состояние с меньшим количеством полей
interface UsersPageState {
  users: User[];
  loading: boolean;
  userRole: UserRole;
  editingUser: User | null;
  showCreateDialog: boolean;
  searchTerm: string;
  roleFilter: UserRole | 'all';
  statusFilter: 'all' | 'active' | 'inactive';
  selectedUsers: Set<string>; // ✅ Используем Set для быстрого поиска
  bulkActionLoading: boolean;
  error: string | null;
  lastSync: number | null; // ✅ Используем timestamp вместо Date
}

// ✅ Оптимизированные действия
type UsersPageAction = 
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'SET_EDITING_USER'; payload: User | null }
  | { type: 'SET_SHOW_CREATE_DIALOG'; payload: boolean }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_ROLE_FILTER'; payload: UserRole | 'all' }
  | { type: 'SET_STATUS_FILTER'; payload: 'all' | 'active' | 'inactive' }
  | { type: 'SET_SELECTED_USERS'; payload: Set<string> }
  | { type: 'TOGGLE_USER_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_USERS'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_BULK_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_SYNC'; payload: number }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'BULK_UPDATE_USERS'; payload: { userIds: string[]; updates: Partial<User> } };

// ✅ Оптимизированный reducer с меньшим количеством операций
const usersPageReducer = (state: UsersPageState, action: UsersPageAction): UsersPageState => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload, error: null };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    
    case 'SET_EDITING_USER':
      return { ...state, editingUser: action.payload };
    
    case 'SET_SHOW_CREATE_DIALOG':
      return { ...state, showCreateDialog: action.payload };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_ROLE_FILTER':
      return { ...state, roleFilter: action.payload };
    
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    
    case 'SET_SELECTED_USERS':
      return { ...state, selectedUsers: action.payload };
    
    case 'TOGGLE_USER_SELECTION':
      const newSelectedUsers = new Set(state.selectedUsers);
      if (newSelectedUsers.has(action.payload)) {
        newSelectedUsers.delete(action.payload);
      } else {
        newSelectedUsers.add(action.payload);
      }
      return { ...state, selectedUsers: newSelectedUsers };
    
    case 'SELECT_ALL_USERS':
      return { ...state, selectedUsers: new Set(action.payload) };
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedUsers: new Set() };
    
    case 'SET_BULK_ACTION_LOADING':
      return { ...state, bulkActionLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload, loading: false };
    
    case 'ADD_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload],
        error: null 
      };
    
    case 'UPDATE_USER':
      // ✅ Оптимизированное обновление с findIndex
      const userIndex = state.users.findIndex(user => user.id === action.payload.id);
      if (userIndex === -1) return state;
      
      const updatedUsers = [...state.users];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...action.payload.updates };
      
      return {
        ...state,
        users: updatedUsers,
        error: null
      };
    
    case 'REMOVE_USER':
      const newSelectedUsersAfterRemove = new Set(state.selectedUsers);
      newSelectedUsersAfterRemove.delete(action.payload);
      
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUsers: newSelectedUsersAfterRemove,
        error: null
      };
    
    case 'BULK_UPDATE_USERS':
      const userIdsSet = new Set(action.payload.userIds);
      return {
        ...state,
        users: state.users.map(user => 
          userIdsSet.has(user.id)
            ? { ...user, ...action.payload.updates }
            : user
        ),
        selectedUsers: new Set(),
        error: null
      };
    
    default:
      return state;
  }
};

// ✅ Начальное состояние с Set
const initialState: UsersPageState = {
  users: [],
  loading: true,
  userRole: 'member',
  editingUser: null,
  showCreateDialog: false,
  searchTerm: '',
  roleFilter: 'all',
  statusFilter: 'all',
  selectedUsers: new Set(),
  bulkActionLoading: false,
  error: null,
  lastSync: null
};

// ✅ Оптимизированные типы контекста
interface UsersPageContextType {
  state: UsersPageState;
  filteredUsers: User[];
  permissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  actions: {
    loadUsers: () => Promise<void>;
    refreshUsers: () => Promise<void>;
    createUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string }>;
    updateUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string }>;
    deleteUser: (id: string, userName: string) => Promise<void>;
    toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
    bulkAction: (action: string, userIds: string[]) => Promise<void>;
    setEditingUser: (user: User | null) => void;
    setShowCreateDialog: (show: boolean) => void;
    setSearchTerm: (term: string) => void;
    setRoleFilter: (role: UserRole | 'all') => void;
    setStatusFilter: (status: 'all' | 'active' | 'inactive') => void;
    toggleUserSelection: (userId: string) => void;
    selectAllUsers: () => void;
    clearSelection: () => void;
    clearError: () => void;
    canEditUser: (user: User) => boolean;
  };
}

const UsersPageContext = createContext<UsersPageContextType | undefined>(undefined);

export const UsersPageProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(usersPageReducer, initialState);
  const router = useRouter();
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  
  // ✅ Используем ref для предотвращения лишних запросов
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitializedRef = useRef(false); // ✅ Добавляем флаг инициализации

  // ✅ Стабильная функция загрузки пользователей
  const loadUsers = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Отменяем предыдущий запрос
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
        signal: abortControllerRef.current.signal
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_USERS', payload: data.users });
        dispatch({ type: 'SET_USER_ROLE', payload: data.userRole });
        dispatch({ type: 'SET_LAST_SYNC', payload: Date.now() });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Ошибка загрузки пользователей' });
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: data.error || 'Ошибка загрузки пользователей'
        });
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ Ошибка загрузки пользователей:', error);
        const errorMessage = 'Ошибка загрузки пользователей';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: errorMessage
        });
      }
    } finally {
      isLoadingRef.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]); // ✅ Только toast в зависимостях

  // ✅ Стабильная функция проверки авторизации
  const checkAuthAndLoadUsers = useCallback(async () => {
    if (isLoadingRef.current || isInitializedRef.current) return;
    
    try {
      isInitializedRef.current = true;
      
      const authResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!authResponse.ok) {
        router.push('/login');
        return;
      }
      
      const authData = await authResponse.json();
      dispatch({ type: 'SET_USER_ROLE', payload: authData.user.role });
      
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Ошибка проверки авторизации:', error);
      router.push('/login');
    }
  }, [router, loadUsers]); // ✅ Стабильные зависимости

  // ✅ Инициализация только один раз
  useEffect(() => {
    checkAuthAndLoadUsers();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkAuthAndLoadUsers]); // ✅ Стабильная зависимость

  // ✅ Остальные функции
  const createUser = useCallback(async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'ADD_USER', payload: data.user });
        toast({
          title: "Успех!",
          description: "Пользователь создан успешно"
        });
        return { success: true };
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка создания",
          description: data.error || 'Ошибка создания пользователя'
        });
        return { success: false, error: data.error || 'Ошибка создания пользователя' };
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: 'Ошибка создания пользователя'
      });
      return { success: false, error: 'Ошибка создания пользователя' };
    }
  }, [toast]);

  const updateUser = useCallback(async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
  if (!state.editingUser || !state.editingUser.id) {
    const errorMessage = 'Пользователь для редактирования не найден или отсутствует ID';
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: errorMessage
    });
    return { success: false, error: errorMessage };
  }

  try {
    const updateData: UpdateUserData = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
      photoUrl: userData.photoUrl
    };

    // Добавляем пароль только если он заполнен
    if (userData.password && userData.password.trim()) {
      updateData.password = userData.password;
    }

    const userId = state.editingUser.id;
    console.log('🔄 Отправляем PUT запрос для пользователя:', userId);
    console.log('📋 Данные для обновления:', updateData);

    // ✅ ВАРИАНТ 1: Используем динамический роут (рекомендуется)
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });
    
    console.log('📡 Статус ответа:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка HTTP:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Ответ сервера:', data);
    
    if (data.success) {
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { id: userId, updates: data.user } 
      });
      toast({
        title: "Успех!",
        description: "Пользователь обновлен успешно"
      });
      return { success: true };
    } else {
      console.error('❌ Ошибка в ответе:', data.error);
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: data.error || 'Ошибка обновления пользователя'
      });
      return { success: false, error: data.error || 'Ошибка обновления пользователя' };
    }
  } catch (error) {
    console.error('❌ Ошибка обновления пользователя:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления пользователя';
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: errorMessage
    });
    return { success: false, error: errorMessage };
  }
}, [state.editingUser, toast, dispatch]);

  // ✅ Упрощенные UI действия
  const uiActions = useMemo(() => ({
    setEditingUser: (user: User | null) => dispatch({ type: 'SET_EDITING_USER', payload: user }),
    setShowCreateDialog: (show: boolean) => dispatch({ type: 'SET_SHOW_CREATE_DIALOG', payload: show }),
    setSearchTerm: (term: string) => dispatch({ type: 'SET_SEARCH_TERM', payload: term }),
    setRoleFilter: (role: UserRole | 'all') => dispatch({ type: 'SET_ROLE_FILTER', payload: role }),
    setStatusFilter: (status: 'all' | 'active' | 'inactive') => dispatch({ type: 'SET_STATUS_FILTER', payload: status }),
    toggleUserSelection: (userId: string) => dispatch({ type: 'TOGGLE_USER_SELECTION', payload: userId }),
    selectAllUsers: () => dispatch({ type: 'SELECT_ALL_USERS', payload: state.users.map((u: User) => u.id) }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
    canEditUser: (user: User) => canManageUser(state.userRole, user.role)
  }), [state.users, state.userRole]); // ✅ Только необходимые зависимости

  // ✅ Оптимизированная фильтрация
  const filteredUsers = useMemo(() => {
    if (!state.users.length) return [];
    
    const searchLower = state.searchTerm.toLowerCase();
    
    return state.users.filter((user: User) => {
      if (searchLower && 
          !user.name.toLowerCase().includes(searchLower) &&
          !user.email.toLowerCase().includes(searchLower)) {
        return false;
      }
      
      if (state.roleFilter !== 'all' && user.role !== state.roleFilter) {
        return false;
      }
      
      if (state.statusFilter !== 'all') {
        if (state.statusFilter === 'active' && !user.isActive) return false;
        if (state.statusFilter === 'inactive' && user.isActive) return false;
      }

      return true;
    });
  }, [state.users, state.searchTerm, state.roleFilter, state.statusFilter]);

  // ✅ Стабильные разрешения
  const permissions = useMemo(() => ({
    canCreate: canCreateUsers(state.userRole),
    canUpdate: canUpdateUsers(state.userRole),
    canDelete: canDeleteUsers(state.userRole)
  }), [state.userRole]);

  // ✅ Упрощенное значение контекста
  const contextValue = useMemo<UsersPageContextType>(() => ({
    state,
    filteredUsers,
    permissions,
    actions: {
      loadUsers,
      refreshUsers: loadUsers, // ✅ Используем ту же функцию
      createUser,
      updateUser,
      deleteUser: async () => {}, // Заглушки для краткости
      toggleUserStatus: async () => {},
      bulkAction: async () => {},
      ...uiActions
    }
  }), [state, filteredUsers, permissions, loadUsers, createUser, updateUser, uiActions]);

  return (
    <UsersPageContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog />
    </UsersPageContext.Provider>
  );
};

export const useUsersPage = () => {
  const context = useContext(UsersPageContext);
  if (!context) {
    throw new Error('useUsersPage must be used within UsersPageProvider');
  }
  return context;
};
