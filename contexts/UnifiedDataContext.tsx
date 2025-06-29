// contexts/UnifiedDataContext.tsx
"use client";

import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';

// Типы данных (остаются как есть)
export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  specializations: string[];
  experience?: number;
  rating: number;
  totalClients: number;
  activeClients: number;
  totalWorkouts: number;
  totalSessions?: number;
  monthlyRevenue: number;
  hourlyRate?: number;
  certifications?: string[];
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  lastActivity: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  joinDate: string;
  trainerId?: string;
  trainerName?: string;
  membershipType: string;
  membershipExpiry: string;
  totalSessions: number;
  lastVisit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleEvent {
  id?: string;
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'meeting' | 'break' | 'other';
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  price: number;
  inStock: number;
  minStock: number;
  isPopular: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Analytics {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
    byRole: Record<string, number>;
    registrationTrend: Array<{ date: string; count: number }>;
  };
  revenue: {
    total: number;
    monthly: number;
    thisMonth?: number;
    growth: number;
    byProduct: Array<{ name: string; revenue: number }>;
    trend: Array<{ date: string; amount: number }>;
  };
  activity: {
    totalSessions: number;
    averageSessionTime: number;
    pageViews: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    byCategory: Record<string, number>;
    salesTrend: Array<{ date: string; sales: number; revenue: number }>;
  };
}

// Состояние через useReducer
interface UnifiedDataState {
  trainers: Trainer[];
  clients: Client[];
  events: ScheduleEvent[];
  products: Product[];
  analytics: Analytics | null;
  lastSync: Date | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  retryCount: number;
  syncingTrainers: boolean;
  syncingClients: boolean;
  syncingEvents: boolean;
  syncingProducts: boolean;
  syncingAnalytics: boolean;
  syncQueue: string[];
  currentSyncOperation: string | null;
  syncInProgress: boolean;
}

// Действия для reducer
type UnifiedDataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TRAINERS'; payload: Trainer[] }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'SET_EVENTS'; payload: ScheduleEvent[] }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_ANALYTICS'; payload: Analytics | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_RETRY_COUNT'; payload: number }
  | { type: 'SET_SYNCING_TRAINERS'; payload: boolean }
  | { type: 'SET_SYNCING_CLIENTS'; payload: boolean }
  | { type: 'SET_SYNCING_EVENTS'; payload: boolean }
  | { type: 'SET_SYNCING_PRODUCTS'; payload: boolean }
  | { type: 'SET_SYNCING_ANALYTICS'; payload: boolean }
  | { type: 'SET_SYNC_QUEUE'; payload: string[] }
  | { type: 'REMOVE_FROM_SYNC_QUEUE'; payload: string }
  | { type: 'CLEAR_SYNC_QUEUE' }
  | { type: 'SET_CURRENT_SYNC_OPERATION'; payload: string | null }
  | { type: 'SET_SYNC_IN_PROGRESS'; payload: boolean }
  | { type: 'ADD_EVENT'; payload: ScheduleEvent }
  | { type: 'UPDATE_EVENT'; payload: { id: string; updates: Partial<ScheduleEvent> } }
  | { type: 'REMOVE_EVENT'; payload: string }
  | { type: 'ADD_TRAINER'; payload: Trainer }
  | { type: 'UPDATE_TRAINER'; payload: { id: string; updates: Partial<Trainer> } }
  | { type: 'REMOVE_TRAINER'; payload: string }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; updates: Partial<Client> } }
  | { type: 'REMOVE_CLIENT'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'RESET_ERROR' }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_RETRY' };

// Reducer функция
const unifiedDataReducer = (state: UnifiedDataState, action: UnifiedDataAction): UnifiedDataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_TRAINERS':
      return { 
        ...state, 
        trainers: action.payload, 
        error: null,
        syncingTrainers: false 
      };
    
    case 'SET_CLIENTS':
      return { 
        ...state, 
        clients: action.payload, 
        error: null,
        syncingClients: false 
      };
    
    case 'SET_EVENTS':
      return { 
        ...state, 
        events: action.payload, 
        error: null,
        syncingEvents: false 
      };
    
    case 'SET_PRODUCTS':
      return { 
        ...state, 
        products: action.payload, 
        error: null,
        syncingProducts: false 
      };
    
    case 'SET_ANALYTICS':
      return { 
        ...state, 
        analytics: action.payload, 
        error: null,
        syncingAnalytics: false 
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        loading: false,
        syncingTrainers: false,
        syncingClients: false,
        syncingEvents: false,
        syncingProducts: false,
        syncingAnalytics: false,
        syncInProgress: false
      };
    
    case 'SET_LAST_SYNC':
      return { 
        ...state, 
        lastSync: action.payload,
        loading: false,
        error: null,
        retryCount: 0,
        syncInProgress: false
      };
    
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    
    case 'SET_RETRY_COUNT':
      return { ...state, retryCount: action.payload };
    
    case 'SET_SYNCING_TRAINERS':
      return { ...state, syncingTrainers: action.payload };
    
    case 'SET_SYNCING_CLIENTS':
      return { ...state, syncingClients: action.payload };
    
    case 'SET_SYNCING_EVENTS':
      return { ...state, syncingEvents: action.payload };
    
    case 'SET_SYNCING_PRODUCTS':
      return { ...state, syncingProducts: action.payload };
    
    case 'SET_SYNCING_ANALYTICS':
      return { ...state, syncingAnalytics: action.payload };
    
    case 'SET_SYNC_QUEUE':
      return { ...state, syncQueue: action.payload };
    
    case 'REMOVE_FROM_SYNC_QUEUE':
      return { 
        ...state, 
        syncQueue: state.syncQueue.filter(item => item !== action.payload)
      };
    
    case 'CLEAR_SYNC_QUEUE':
      return { 
        ...state, 
        syncQueue: [],
        currentSyncOperation: null,
        syncInProgress: false
      };
    
    case 'SET_CURRENT_SYNC_OPERATION':
      return { ...state, currentSyncOperation: action.payload };
    
    case 'SET_SYNC_IN_PROGRESS':
      return { ...state, syncInProgress: action.payload };
    
    // События
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload]
      };
    
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event._id === action.payload.id 
            ? { ...event, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : event
        )
      };
    
    case 'REMOVE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event._id !== action.payload)
      };
    
    // Тренеры
    case 'ADD_TRAINER':
      return {
        ...state,
        trainers: [...state.trainers, action.payload]
      };
    
    case 'UPDATE_TRAINER':
      return {
        ...state,
        trainers: state.trainers.map(trainer => 
          trainer.id === action.payload.id 
            ? { ...trainer, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : trainer
        )
      };
    
    case 'REMOVE_TRAINER':
      return {
        ...state,
        trainers: state.trainers.filter(trainer => trainer.id !== action.payload)
      };
    
    // Клиенты
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload]
      };
    
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client => 
          client.id === action.payload.id 
            ? { ...client, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : client
        )
      };
    
    case 'REMOVE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload)
      };
    
    // Продукты
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product._id === action.payload.id 
            ? { ...product, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : product
        )
      };
    
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product._id !== action.payload)
      };
    
    case 'RESET_ERROR':
      return { ...state, error: null };
    
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    
    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };
    
    default:
      return state;
  }
};

// Начальное состояние
const initialState: UnifiedDataState = {
  trainers: [],
  clients: [],
  events: [],
  products: [],
  analytics: null,
  lastSync: null,
  loading: true,
  error: null,
  isOnline: true,
  retryCount: 0,
  syncingTrainers: false,
  syncingClients: false,
  syncingEvents: false,
  syncingProducts: false,
  syncingAnalytics: false,
  syncQueue: [],
  currentSyncOperation: null,
  syncInProgress: false
};

// Типы для контекста
interface UnifiedDataContextType {
  // Состояние
  trainers: Trainer[];
  clients: Client[];
  events: ScheduleEvent[];
  products: Product[];
  analytics: Analytics | null;
  lastSync: Date | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  retryCount: number;
  syncingTrainers: boolean;
  syncingClients: boolean;
  syncingEvents: boolean;
  syncingProducts: boolean;
  syncingAnalytics: boolean;
  syncQueue: string[];
  currentSyncOperation: string | null;
  syncInProgress: boolean;
  
  // Действия синхронизации
  syncAllData: () => Promise<void>;
  syncTrainers: () => Promise<void>;
  syncClients: () => Promise<void>;
  syncEvents: () => Promise<void>;
  syncProducts: () => Promise<void>;
  syncAnalytics: () => Promise<void>;
  
  // Локальные операции с событиями
  addEvent: (event: ScheduleEvent) => void;
  updateEvent: (eventId: string, updates: Partial<ScheduleEvent>) => void;
  removeEvent: (eventId: string) => void;
  
  // Локальные операции с тренерами
  addTrainer: (trainer: Trainer) => void;
  updateTrainer: (trainerId: string, updates: Partial<Trainer>) => void;
  removeTrainer: (trainerId: string) => void;
  
  // Локальные операции с клиентами
  addClient: (client: Client) => void;
    updateClient: (clientId: string, updates: Partial<Client>) => void;
  removeClient: (clientId: string) => void;
  
  // Локальные операции с продуктами
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
  
  // Утилиты
  clearError: () => void;
  forceRefresh: () => Promise<void>;
}

const UnifiedDataContext = createContext<UnifiedDataContextType | undefined>(undefined);

// Провайдер контекста
export const UnifiedDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(unifiedDataReducer, initialState);

  // Универсальная функция для API запросов с retry логикой
  const fetchWithRetry = useCallback(async (url: string, options: RequestInit = {}, maxRetries = 3): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Попытка $${attempt}/$${maxRetries} для ${url}`);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Успешно загружено из ${url}`);
        return data;

      } catch (error) {
        console.error(`❌ Ошибка при загрузке ${url} (попытка ${attempt}):`, error);
        
        if (attempt === maxRetries) {
          dispatch({ type: 'INCREMENT_RETRY' });
          throw error;
        }
        
        // Экспоненциальная задержка между попытками
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }, []);

  // Внутренние функции синхронизации (выполняются синхронно)
  const syncTrainersInternal = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SYNCING_TRAINERS', payload: true });
      console.log('👥 Синхронизация тренеров...');
      
      const trainersData = await fetchWithRetry('/api/admin/trainers');
      
      dispatch({ 
        type: 'SET_TRAINERS', 
        payload: Array.isArray(trainersData) ? trainersData : [] 
      });

      console.log('👥 Тренеры синхронизированы:', trainersData?.length || 0);
      return true;
    } catch (error) {
      console.error('❌ Ошибка синхронизации тренеров:', error);
      throw error;
    }
  }, [fetchWithRetry]);

  const syncClientsInternal = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SYNCING_CLIENTS', payload: true });
      console.log('👤 Синхронизация клиентов...');
      
      const clientsData = await fetchWithRetry('/api/admin/clients');
      
      dispatch({ 
        type: 'SET_CLIENTS', 
        payload: Array.isArray(clientsData) ? clientsData : [] 
      });

      console.log('👤 Клиенты синхронизированы:', clientsData?.length || 0);
      return true;
    } catch (error) {
      console.error('❌ Ошибка синхронизации клиентов:', error);
      throw error;
    }
  }, [fetchWithRetry]);

  const syncEventsInternal = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SYNCING_EVENTS', payload: true });
      console.log('📅 Синхронизация событий...');
      
      const eventsResponse = await fetchWithRetry('/api/admin/schedule');
      const eventsData = eventsResponse?.data?.events || eventsResponse?.events || [];
      
      dispatch({ 
        type: 'SET_EVENTS', 
        payload: Array.isArray(eventsData) ? eventsData : [] 
      });

      console.log('📅 События синхронизированы:', eventsData?.length || 0);
      return true;
    } catch (error) {
      console.error('❌ Ошибка синхронизации событий:', error);
      throw error;
    }
  }, [fetchWithRetry]);

  const syncProductsInternal = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SYNCING_PRODUCTS', payload: true });
      console.log('📦 Синхронизация продуктов...');
      
      const productsResponse = await fetchWithRetry('/api/products');
      const productsData = productsResponse?.products || productsResponse?.data || [];
      
      dispatch({ 
        type: 'SET_PRODUCTS', 
        payload: Array.isArray(productsData) ? productsData : [] 
      });

      console.log('📦 Продукты синхронизированы:', productsData?.length || 0);
      return true;
    } catch (error) {
      console.error('❌ Ошибка синхронизации продуктов:', error);
      throw error;
    }
  }, [fetchWithRetry]);

  const syncAnalyticsInternal = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SYNCING_ANALYTICS', payload: true });
      console.log('📊 Синхронизация аналитики...');
      
      const analyticsResponse = await fetchWithRetry('/api/admin/analytics');
      const analyticsData = analyticsResponse?.data || analyticsResponse;
      
      dispatch({ 
        type: 'SET_ANALYTICS', 
        payload: analyticsData || null 
      });

      console.log('📊 Аналитика синхронизирована');
      return true;
    } catch (error) {
      console.error('❌ Ошибка синхронизации аналитики:', error);
      throw error;
    }
  }, [fetchWithRetry]);

  // Синхронная обработка очереди
  const processSyncQueue = useCallback(async () => {
    if (state.syncQueue.length === 0 || state.syncInProgress) {
      return;
    }

    dispatch({ type: 'SET_SYNC_IN_PROGRESS', payload: true });
    
    const operations = [...state.syncQueue];
    dispatch({ type: 'CLEAR_SYNC_QUEUE' });

    console.log(`🔄 Обрабатываем очередь синхронизации: [${operations.join(', ')}]`);

    try {
      for (const operation of operations) {
        dispatch({ type: 'SET_CURRENT_SYNC_OPERATION', payload: operation });
        console.log(`🔄 Выполняем операцию: ${operation}`);

        switch (operation) {
          case 'trainers':
            await syncTrainersInternal();
            break;
          case 'clients':
            await syncClientsInternal();
            break;
          case 'events':
            await syncEventsInternal();
            break;
          case 'products':
            await syncProductsInternal();
            break;
          case 'analytics':
            await syncAnalyticsInternal();
            break;
          default:
            console.warn(`⚠️ Неизвестная операция синхронизации: ${operation}`);
        }

        console.log(`✅ Операция ${operation} завершена`);
        
        // Небольшая задержка между операциями для стабильности
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      dispatch({ type: 'SET_CURRENT_SYNC_OPERATION', payload: null });
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
      console.log('✅ Вся очередь синхронизации обработана успешно');

    } catch (error) {
      console.error('❌ Ошибка при обработке очереди синхронизации:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: `Ошибка синхронизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      });
    } finally {
      dispatch({ type: 'SET_SYNC_IN_PROGRESS', payload: false });
      dispatch({ type: 'SET_CURRENT_SYNC_OPERATION', payload: null });
    }
  }, [state.syncQueue, state.syncInProgress, syncTrainersInternal, syncClientsInternal, syncEventsInternal, syncProductsInternal, syncAnalyticsInternal]);

  // Функция добавления операции в очередь
  const addToSyncQueue = useCallback((operation: string) => {
    if (!state.syncQueue.includes(operation)) {
      const newQueue = [...state.syncQueue, operation];
      dispatch({ type: 'SET_SYNC_QUEUE', payload: newQueue });
      console.log(`➕ Добавлена операция в очередь: ${operation}`);
    }
  }, [state.syncQueue]);

  // Публичные функции синхронизации
  const syncTrainers = useCallback(async () => {
    addToSyncQueue('trainers');
  }, [addToSyncQueue]);

  const syncClients = useCallback(async () => {
    addToSyncQueue('clients');
  }, [addToSyncQueue]);

  const syncEvents = useCallback(async () => {
    addToSyncQueue('events');
  }, [addToSyncQueue]);

  const syncProducts = useCallback(async () => {
    addToSyncQueue('products');
  }, [addToSyncQueue]);

  const syncAnalytics = useCallback(async () => {
    addToSyncQueue('analytics');
  }, [addToSyncQueue]);

  // Полная синхронизация всех данных
  const syncAllData = useCallback(async () => {
    console.log('🔄 Начинаем полную синхронизацию данных...');
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'RESET_ERROR' });

    // Добавляем все операции в очередь
    const syncOperations = ['trainers', 'clients', 'events', 'products', 'analytics'];
    const newQueue = [...state.syncQueue];
    
    syncOperations.forEach(operation => {
      if (!newQueue.includes(operation)) {
        newQueue.push(operation);
      }
    });
    
    dispatch({ type: 'SET_SYNC_QUEUE', payload: newQueue });
  }, [state.syncQueue]);

  // Принудительное обновление
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Принудительное обновление данных...');
    dispatch({ type: 'RESET_RETRY' });
    dispatch({ type: 'CLEAR_SYNC_QUEUE' });
    await syncAllData();
  }, [syncAllData]);

  // Мемоизированные локальные операции с событиями
  const eventActions = useMemo(() => ({
    addEvent: (event: ScheduleEvent) => {
      dispatch({ type: 'ADD_EVENT', payload: event });
      console.log('➕ Событие добавлено локально:', event.title);
    },

    updateEvent: (eventId: string, updates: Partial<ScheduleEvent>) => {
      dispatch({ type: 'UPDATE_EVENT', payload: { id: eventId, updates } });
      console.log('✏️ Событие обновлено локально:', eventId);
    },

    removeEvent: (eventId: string) => {
      dispatch({ type: 'REMOVE_EVENT', payload: eventId });
      console.log('🗑️ Событие удалено локально:', eventId);
    }
  }), []);

  // Мемоизированные локальные операции с тренерами
  const trainerActions = useMemo(() => ({
    addTrainer: (trainer: Trainer) => {
      dispatch({ type: 'ADD_TRAINER', payload: trainer });
      console.log('➕ Тренер добавлен локально:', trainer.name);
    },

    updateTrainer: (trainerId: string, updates: Partial<Trainer>) => {
      dispatch({ type: 'UPDATE_TRAINER', payload: { id: trainerId, updates } });
      console.log('✏️ Тренер обновлен локально:', trainerId);
    },

    removeTrainer: (trainerId: string) => {
      dispatch({ type: 'REMOVE_TRAINER', payload: trainerId });
      console.log('🗑️ Тренер удален локально:', trainerId);
    }
  }), []);

  // Мемоизированные локальные операции с клиентами
  const clientActions = useMemo(() => ({
    addClient: (client: Client) => {
      dispatch({ type: 'ADD_CLIENT', payload: client });
      console.log('➕ Клиент добавлен локально:', client.name);
    },

    updateClient: (clientId: string, updates: Partial<Client>) => {
      dispatch({ type: 'UPDATE_CLIENT', payload: { id: clientId, updates } });
      console.log('✏️ Клиент обновлен локально:', clientId);
    },

    removeClient: (clientId: string) => {
      dispatch({ type: 'REMOVE_CLIENT', payload: clientId });
      console.log('🗑️ Клиент удален локально:', clientId);
    }
  }), []);

  // Мемоизированные локальные операции с продуктами
  const productActions = useMemo(() => ({
    addProduct: (product: Product) => {
      dispatch({ type: 'ADD_PRODUCT', payload: product });
      console.log('➕ Продукт добавлен локально:', product.name);
    },

    updateProduct: (productId: string, updates: Partial<Product>) => {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, updates } });
      console.log('✏️ Продукт обновлен локально:', productId);
    },

    removeProduct: (productId: string) => {
      dispatch({ type: 'REMOVE_PRODUCT', payload: productId });
      console.log('🗑️ Продукт удален локально:', productId);
    }
  }), []);

  // Утилиты
  const clearError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' });
  }, []);

  // Эффект для обработки очереди синхронизации
  useEffect(() => {
    if (state.syncQueue.length > 0 && !state.syncInProgress) {
      processSyncQueue();
    }
  }, [state.syncQueue, state.syncInProgress, processSyncQueue]);

  // Проверка сетевого соединения
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', payload: true });
      dispatch({ type: 'RESET_RETRY' });
      console.log('🌐 Соединение восстановлено, синхронизируем данные...');
      syncAllData();
    };

        const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE', payload: false });
      console.log('📡 Соединение потеряно, переходим в оффлайн режим');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAllData]);

  // Автоматическая синхронизация при монтировании
  

  // Периодическая синхронизация каждые 5 минут
  useEffect(() => {
    if (!state.isOnline) return;

    const interval = setInterval(() => {
      console.log('⏰ Периодическая синхронизация данных...');
      syncAllData();
    }, 5 * 60 * 1000); // 5 минут

    return () => clearInterval(interval);
  }, [syncAllData, state.isOnline]);

  // Автоматический retry при ошибках
  useEffect(() => {
    if (state.retryCount > 0 && state.retryCount < 5 && state.isOnline && !state.syncInProgress) {
      const timeout = setTimeout(() => {
        console.log(`🔄 Автоматический retry ${state.retryCount}/5...`);
        syncAllData();
      }, Math.pow(2, state.retryCount) * 5000); // Экспоненциальная задержка

      return () => clearTimeout(timeout);
    }
  }, [state.retryCount, state.isOnline, state.syncInProgress, syncAllData]);

  // Мемоизированное значение контекста
  const contextValue = useMemo<UnifiedDataContextType>(() => ({
    // Состояние
    trainers: state.trainers,
    clients: state.clients,
    events: state.events,
    products: state.products,
    analytics: state.analytics,
    lastSync: state.lastSync,
    loading: state.loading,
    error: state.error,
    isOnline: state.isOnline,
    retryCount: state.retryCount,
    syncingTrainers: state.syncingTrainers,
    syncingClients: state.syncingClients,
    syncingEvents: state.syncingEvents,
    syncingProducts: state.syncingProducts,
    syncingAnalytics: state.syncingAnalytics,
    syncQueue: state.syncQueue,
    currentSyncOperation: state.currentSyncOperation,
    syncInProgress: state.syncInProgress,
    
    // Действия синхронизации
    syncAllData,
    syncTrainers,
    syncClients,
    syncEvents,
    syncProducts,
    syncAnalytics,
    
    // Локальные операции
    ...eventActions,
    ...trainerActions,
    ...clientActions,
    ...productActions,
    
    // Утилиты
    clearError,
    forceRefresh
  }), [
    state,
    syncAllData,
    syncTrainers,
    syncClients,
    syncEvents,
    syncProducts,
    syncAnalytics,
    eventActions,
    trainerActions,
    clientActions,
    productActions,
    clearError,
    forceRefresh
  ]);

  return (
    <UnifiedDataContext.Provider value={contextValue}>
      {children}
    </UnifiedDataContext.Provider>
  );
};

// Хук для использования контекста
export const useUnifiedData = () => {
  const context = useContext(UnifiedDataContext);
  if (context === undefined) {
    throw new Error('useUnifiedData must be used within a UnifiedDataProvider');
  }
  return context;
};

// Специализированные хуки для отдельных типов данных
export const useTrainers = () => {
  const { 
    trainers, 
    syncTrainers, 
    addTrainer, 
    updateTrainer, 
    removeTrainer, 
    loading, 
    syncingTrainers,
    error 
  } = useUnifiedData();
  
  return { 
    trainers, 
    syncTrainers, 
    addTrainer, 
    updateTrainer, 
    removeTrainer, 
    loading: loading || syncingTrainers, 
    error 
  };
};

export const useClients = () => {
  const { 
    clients, 
    syncClients, 
    addClient,
    updateClient,
    removeClient,
    loading, 
    syncingClients,
    error 
  } = useUnifiedData();
  
  return { 
    clients, 
    syncClients, 
    addClient,
    updateClient,
    removeClient,
    loading: loading || syncingClients, 
    error 
  };
};

export const useSchedule = () => {
  const { 
    events, 
    syncEvents, 
    addEvent, 
    updateEvent, 
    removeEvent, 
    loading, 
    syncingEvents,
    error 
  } = useUnifiedData();
  
  return { 
    events, 
    syncEvents, 
    addEvent, 
    updateEvent, 
    removeEvent, 
    loading: loading || syncingEvents, 
    error 
  };
};

export const useProducts = () => {
  const { 
    products, 
    syncProducts, 
    addProduct,
    updateProduct,
    removeProduct,
    loading, 
    syncingProducts,
    error 
  } = useUnifiedData();
  
  return { 
    products, 
    syncProducts, 
    addProduct,
    updateProduct,
    removeProduct,
    loading: loading || syncingProducts, 
    error 
  };
};

export const useAnalytics = () => {
  const { 
    analytics, 
    syncAnalytics, 
    loading, 
    syncingAnalytics,
    error 
  } = useUnifiedData();
  
  return { 
    analytics, 
    syncAnalytics, 
    loading: loading || syncingAnalytics, 
    error 
  };
};

// Хук для статуса синхронизации
export const useSyncStatus = () => {
  const {
    loading,
    error,
    isOnline,
    retryCount,
    lastSync,
    syncingTrainers,
    syncingClients,
    syncingEvents,
    syncingProducts,
    syncingAnalytics,
    syncQueue,
    currentSyncOperation,
    syncInProgress,
    clearError,
    forceRefresh
  } = useUnifiedData();

  const isAnySyncing = syncingTrainers || syncingClients || syncingEvents || syncingProducts || syncingAnalytics || syncInProgress;
  
  return {
    loading,
    error,
    isOnline,
    retryCount,
    lastSync,
    isAnySyncing,
    syncingTrainers,
    syncingClients,
    syncingEvents,
    syncingProducts,
    syncingAnalytics,
    syncQueue,
    currentSyncOperation,
    syncInProgress,
    clearError,
    forceRefresh
  };
};

// Хук для получения агрегированных данных
export const useDataSummary = () => {
  const { trainers, clients, events, products, analytics } = useUnifiedData();

  return useMemo(() => ({
    totalTrainers: trainers.length,
    activeTrainers: trainers.filter(t => t.status === 'active').length,
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalEvents: events.length,
    upcomingEvents: events.filter(e => new Date(e.startTime) > new Date()).length,
    totalProducts: products.length,
    lowStockProducts: products.filter(p => p.inStock <= p.minStock).length,
    hasAnalytics: !!analytics,
    lastUpdate: new Date().toISOString()
  }), [trainers, clients, events, products, analytics]);
};


