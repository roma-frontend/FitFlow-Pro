// hooks/useMessages.ts (исправленная версия)
import { useState, useEffect, useCallback, useMemo } from "react";
import { Message } from "@/types/messages";
import { Id } from "@/convex/_generated/dataModel";

// Генератор тестовых ID
function generateTestId(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Проверка валидного Convex ID
function isValidConvexId(id: string): boolean {
  return /^[jkmnpqrstvwxyz][a-z0-9]{15,}$/i.test(id);
}

// Создание стабильных тестовых ID
const STABLE_IDS = {
  admin: 'test_admin_stable_001',
  system: 'test_system_stable_002', 
  user1: 'test_user1_stable_003',
  user2: 'test_user2_stable_004',
  trainer1: 'test_trainer1_stable_005',
  trainer2: 'test_trainer2_stable_006',
};

// Тестовые данные
function createTestMessages(): Message[] {
  const now = Date.now();
  
  return [
    {
      _id: generateTestId('msg') as Id<"messages">,
      _creationTime: now,
      type: "direct",
      subject: "Добро пожаловать!",
      content: "Добро пожаловать в систему управления фитнес-клубом! Здесь вы можете управлять тренировками, клиентами и получать уведомления.",
      senderId: STABLE_IDS.admin as Id<"users">,
      senderName: "Администратор",
      recipientIds: [STABLE_IDS.user1 as Id<"users">],
      recipientNames: ["Иван Петров"],
      priority: "normal",
      status: "sent",
      readAt: {},
      isArchived: false,
      scheduledAt: undefined, // Добавляем это поле
    },
    {
      _id: generateTestId('msg') as Id<"messages">,
      _creationTime: now - 3600000,
      type: "notification",
      subject: "Напоминание о тренировке",
      content: "Не забудьте о тренировке сегодня в 18:00! Ваш тренер: Мария Иванова. Место: Зал №1.",
      senderId: STABLE_IDS.system as Id<"users">,
      senderName: "Система уведомлений",
      recipientIds: [STABLE_IDS.user1 as Id<"users">],
      recipientNames: ["Иван Петров"],
      priority: "high",
      status: "sent",
      readAt: {},
      isArchived: false,
      scheduledAt: undefined,
    },
    {
      _id: generateTestId('msg') as Id<"messages">,
      _creationTime: now - 7200000,
      type: "announcement",
      subject: "Новые правила клуба",
      content: "Уважаемые клиенты! С 1 числа вводятся новые правила посещения клуба. Просим ознакомиться с обновленной информацией на стойке регистрации.",
      senderId: STABLE_IDS.admin as Id<"users">,
      senderName: "Администратор",
      recipientIds: [
        STABLE_IDS.user1 as Id<"users">,
        STABLE_IDS.user2 as Id<"users">
      ],
      recipientNames: ["Иван Петров", "Мария Иванова"],
      priority: "normal",
      status: "sent",
      readAt: {
        [STABLE_IDS.user2]: new Date(now - 3600000).toISOString()
      },
      isArchived: false,
      scheduledAt: undefined,
    },
    {
      _id: generateTestId('msg') as Id<"messages">,
      _creationTime: now - 86400000,
      type: "direct",
      subject: "Изменение расписания",
      content: "Здравствуйте! Вынуждена перенести нашу тренировку с завтра на послезавтра на то же время. Извините за неудобства!",
      senderId: STABLE_IDS.trainer1 as Id<"users">,
      senderName: "Мария Иванова",
      recipientIds: [STABLE_IDS.user1 as Id<"users">],
      recipientNames: ["Иван Петров"],
      priority: "urgent",
      status: "sent",
      readAt: {},
      isArchived: false,
      scheduledAt: undefined,
    },
    {
      _id: generateTestId('msg') as Id<"messages">,
      _creationTime: now - 172800000,
      type: "group",
      subject: "Собрание тренеров",
      content: "Завтра в 14:00 состоится собрание всех тренеров в конференц-зале. Обсудим новые программы тренировок.",
      senderId: STABLE_IDS.admin as Id<"users">,
      senderName: "Администратор",
      recipientIds: [
        STABLE_IDS.trainer1 as Id<"users">,
        STABLE_IDS.trainer2 as Id<"users">
      ],
      recipientNames: ["Мария Иванова", "Алексей Сидоров"],
      groupId: generateTestId('group') as Id<"messageGroups">,
      priority: "normal",
      status: "sent",
      readAt: {
        [STABLE_IDS.trainer1]: new Date(now - 86400000).toISOString()
      },
      isArchived: false,
      scheduledAt: undefined,
    }
  ];
}

export const useMessages = (userId?: Id<"users">) => {
  // Состояние
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Инициализация тестовых данных
  useEffect(() => {
    if (!isInitialized) {
      const testMessages = createTestMessages();
      setMessages(testMessages);
      setIsInitialized(true);
      setLoading(false);
    }
  }, [isInitialized]);

  // Вычисляем количество непрочитанных сообщений
  const unreadCount = useMemo(() => {
    if (!userId) return 0;
    
    return messages.filter(msg => {
      const readAt = msg.readAt || {};
      return !readAt[userId] && msg.recipientIds.includes(userId);
    }).length;
  }, [userId, messages]);

  // Функция отметки как прочитанное
  const markAsRead = useCallback(async (messageId: string | Id<"messages">, userId: Id<"users">) => {
    try {
      setMessages(prev => prev.map(msg =>
        msg._id === messageId
          ? {
              ...msg,
              status: "read" as const,
              readAt: { ...msg.readAt, [userId]: new Date().toISOString() }
            }
          : msg
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка отметки как прочитанное: ${errorMessage}`);
      console.error(err);
    }
  }, []);

  // Функция архивирования
  const archiveMessage = useCallback(async (messageId: string | Id<"messages">) => {
    try {
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, isArchived: true } : msg
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка архивирования: ${errorMessage}`);
      console.error(err);
    }
  }, []);

  // Функция удаления
  const deleteMessage = useCallback(async (messageId: string | Id<"messages">) => {
    try {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка удаления: ${errorMessage}`);
      console.error(err);
    }
  }, []);

  // Функция отправки сообщения (исправленная)
  const sendMessage = useCallback(async (messageData: {
    type: "direct" | "group" | "announcement" | "notification";
    subject?: string;
    content: string;
    senderId: Id<"users">;
    senderName: string;
    recipientIds: Id<"users">[];
    recipientNames: string[];
    groupId?: Id<"messageGroups">;
    priority: "low" | "normal" | "high" | "urgent";
    scheduledAt?: number; // Добавляем это поле
  }) => {
    try {
      const newMessage: Message = {
        _id: generateTestId('msg') as Id<"messages">,
        _creationTime: Date.now(),
        ...messageData,
        status: "sent",
        readAt: {},
        isArchived: false,
      };

      setMessages(prev => [newMessage, ...prev]);
      return newMessage._id;
    } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка отправки: ${errorMessage}`);
      console.error(err);
      throw err;
    }
  }, []);

  // Массовые операции
  const bulkMarkAsRead = useCallback(async (messageIds: (string | Id<"messages">)[], userId: Id<"users">) => {
    try {
      setMessages(prev => prev.map(msg =>
        messageIds.includes(msg._id)
          ? {
              ...msg,
              status: "read" as const,
              readAt: { ...msg.readAt, [userId]: new Date().toISOString() }
            }
          : msg
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка массовой отметки: ${errorMessage}`);
      console.error(err);
    }
  }, []);

  const bulkArchive = useCallback(async (messageIds: (string | Id<"messages">)[]) => {
    try {
      setMessages(prev => prev.map(msg =>
        messageIds.includes(msg._id) ? { ...msg, isArchived: true } : msg
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка массового архивирования: ${errorMessage}`);
      console.error(err);
    }
  }, []);

  const bulkDelete = useCallback(async (messageIds: (string | Id<"messages">)[]) => {
    try {
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg._id)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка массового удаления: ${errorMessage}`);
      console.error(err);
    }
  }, []);

  // Функция загрузки сообщений (добавляем для совместимости)
  const loadMessages = useCallback(async (filters?: {
    type?: Message["type"];
    priority?: Message["priority"];
    unreadOnly?: boolean;
    archived?: boolean;
  }) => {
    try {
      setLoading(true);
      let filteredMessages = createTestMessages();
      
      if (filters) {
        if (filters.type) {
          filteredMessages = filteredMessages.filter(msg => msg.type === filters.type);
        }
        if (filters.priority) {
          filteredMessages = filteredMessages.filter(msg => msg.priority === filters.priority);
        }
        if (filters.unreadOnly && userId) {
          filteredMessages = filteredMessages.filter(msg => {
            const readAt = msg.readAt || {};
            return !readAt[userId] && msg.recipientIds.includes(userId);
          });
        }
        if (filters.archived !== undefined) {
          filteredMessages = filteredMessages.filter(msg => msg.isArchived === filters.archived);
        }
      }
      
      setMessages(filteredMessages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка загрузки: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Перезагрузка сообщений
  const refreshMessages = useCallback(() => {
    setMessages(createTestMessages());
  }, []);

  return {
    messages,
    unreadCount,
    loading,
    error,
    isUsingFallback: true, // всегда используем тестовые данные
    apiAvailable: false,   // API недоступен
    markAsRead,
    archiveMessage,
    deleteMessage,
    sendMessage,
    bulkMarkAsRead,
    bulkArchive,
    bulkDelete,
    loadMessages, // Добавляем эту функцию
    clearError,
    refreshMessages,
  };
};

// Остальные хуки остаются без изменений...
export function useMessageSearch(searchTerm: string, userId?: Id<"users">) {
  const { messages } = useMessages(userId);
  
  return useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(term) ||
      (msg.subject && msg.subject.toLowerCase().includes(term)) ||
      msg.senderName.toLowerCase().includes(term) ||
      msg.recipientNames.some(name => name.toLowerCase().includes(term))
    );
  }, [messages, searchTerm]);
}

export function useUnreadMessages(userId: Id<"users">) {
  const { messages } = useMessages(userId);
  
  return useMemo(() => {
    return messages.filter(msg => {
      const readAt = msg.readAt || {};
      return !readAt[userId] && msg.recipientIds.includes(userId);
    });
  }, [messages, userId]);
}

export function useMessagesByType(type: Message["type"], userId?: Id<"users">) {
  const { messages } = useMessages(userId);
  
  return useMemo(() => {
    return messages.filter(msg => msg.type === type);
  }, [messages, type]);
}

export function useMessagesByPriority(priority: Message["priority"], userId?: Id<"users">) {
  const { messages } = useMessages(userId);
  
  return useMemo(() => {
    return messages.filter(msg => msg.priority === priority);
  }, [messages, priority]);
}

// Утилиты для создания тестовых ID
export function createTestUserId(name?: string): Id<"users"> {
  return (name ? `test_user_${name}_${Date.now()}` : generateTestId('user')) as Id<"users">;
}

export function createTestMessageId(): Id<"messages"> {
  return generateTestId('msg') as Id<"messages">;
}

export function createTestGroupId(): Id<"messageGroups"> {
  return generateTestId('group') as Id<"messageGroups">;
}

// Получение стабильных ID для тестирования
export function getStableTestIds() {
  return STABLE_IDS;
}

// Проверка типа ID
export function checkIdType(id: string): 'real' | 'test' {
  return isValidConvexId(id) ? 'real' : 'test';
}

// Функция для получения отладочной информации
export function getMessagesDebugInfo() {
  const testMessages = createTestMessages();
  return {
    totalMessages: testMessages.length,
    messageTypes: testMessages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    priorityDistribution: testMessages.reduce((acc, msg) => {
      acc[msg.priority] = (acc[msg.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    sampleIds: testMessages.slice(0, 3).map(msg => ({
      id: msg._id,
      type: checkIdType(msg._id as string),
      subject: msg.subject || 'Без темы'
    })),
    stableIds: STABLE_IDS,
    apiStatus: 'fallback_only'
  };
}

// Функция для логирования отладочной информации
export function logMessagesDebugInfo() {
  const debugInfo = getMessagesDebugInfo();
  console.group('🔍 Messages Debug Info');
  console.log('Total Messages:', debugInfo.totalMessages);
  console.log('Message Types:', debugInfo.messageTypes);
  console.log('Priority Distribution:', debugInfo.priorityDistribution);
  console.log('Sample IDs:', debugInfo.sampleIds);
  console.log('Stable IDs:', debugInfo.stableIds);
  console.log('API Status:', debugInfo.apiStatus);
  console.groupEnd();
}

// Экспорт типов и констант
export { generateTestId, isValidConvexId };
export type { Message } from "@/types/messages";

// Интерфейс для отладочной информации
export interface MessagesDebugInfo {
  totalMessages: number;
  messageTypes: Record<string, number>;
  priorityDistribution: Record<string, number>;
  sampleIds: Array<{
    id: string;
    type: 'real' | 'test';
    subject: string;
  }>;
  stableIds: typeof STABLE_IDS;
  apiStatus: string;
}

