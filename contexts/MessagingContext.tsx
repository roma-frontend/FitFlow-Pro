// contexts/MessagingContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface Message {
  _id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  recipientNames: string[];
  createdAt: string;
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
  priority: 'low' | 'normal' | 'high';
  relatedTo?: {
    type: 'event' | 'booking' | 'payment' | 'general';
    id: string;
    title: string;
    startTime?: string;
    endTime?: string;
    trainerName?: string;
    clientName?: string;
    location?: string;
    price?: number;
  };
}

interface EventLog {
  _id: string;
  action: 'created' | 'updated' | 'deleted';
  createdBy: string;
  timestamp: string;
  event: {
    _id: string;
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    trainerName: string;
    trainerId: string;
    clientName?: string;
    clientId?: string;
    location?: string;
    price: number;
    status: string;
  };
}

interface MessagingContextType {
  messages: Message[];
  eventLogs: EventLog[];
  messageQueue: Message[];
  isProcessingMessages: boolean;
  sendMessage: (message: Omit<Message, '_id' | 'createdAt' | 'status'>) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  logEvent: (eventLog: Omit<EventLog, '_id' | 'timestamp'>) => Promise<void>;
  getDebugData: () => {
    events: EventLog[];
    notifications: Message[];
    syncStatus: Record<string, boolean>;
  };
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [isProcessingMessages, setIsProcessingMessages] = useState(false);
  const processedEventIds = useRef(new Set<string>());

  // Синхронная обработка очереди сообщений
  const processMessageQueue = useCallback(async () => {
    if (messageQueue.length === 0 || isProcessingMessages) {
      return;
    }

    setIsProcessingMessages(true);
    console.log(`📤 Обрабатываем очередь сообщений: ${messageQueue.length} сообщений`);

    try {
      const messagesToProcess = [...messageQueue];
      setMessageQueue([]); // Очищаем очередь

      for (const message of messagesToProcess) {
        console.log(`📤 Отправляем сообщение: ${message.subject}`);
        
        // Добавляем сообщение в список
        setMessages(prev => [...prev, message]);

        // Имитация доставки с задержкой
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMessages(prev => prev.map(msg => 
          msg._id === message._id 
            ? { ...msg, status: 'delivered' }
            : msg
        ));

        console.log(`✅ Сообщение доставлено: ${message.subject}`);
        
        // Небольшая задержка между сообщениями
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('✅ Вся очередь сообщений обработана');
    } catch (error) {
      console.error('❌ Ошибка при обработке очереди сообщений:', error);
    } finally {
      setIsProcessingMessages(false);
    }
  }, [messageQueue, isProcessingMessages]);

  // Эффект для обработки очереди сообщений
  useEffect(() => {
  let timeoutId: NodeJS.Timeout;
  
  const processQueue = async () => {
    if (messageQueue.length > 0 && !isProcessingMessages) {
      setIsProcessingMessages(true);
      
      try {
        // Обрабатываем только первое сообщение за раз
        const message = messageQueue[0];
        await sendMessage(message);
        
        // Удаляем обработанное сообщение
        setMessageQueue(prev => prev.slice(1));
        
        // Планируем обработку следующего сообщения через небольшую задержку
        if (messageQueue.length > 1) {
          timeoutId = setTimeout(() => {
            setIsProcessingMessages(false);
          }, 100);
        } else {
          setIsProcessingMessages(false);
        }
      } catch (error) {
        console.error('Ошибка обработки очереди:', error);
        setIsProcessingMessages(false);
      }
    }
  };
  
  processQueue();
  
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [messageQueue.length, isProcessingMessages]);

  // Синхронная обработка новых событий
  const processNewEvents = useCallback(async () => {
    const newEvents = eventLogs.filter(eventLog => 
      !processedEventIds.current.has(eventLog.event._id) && 
      eventLog.action === 'created'
    );

    if (newEvents.length === 0) {
      return;
    }

    console.log(`🔔 Обрабатываем ${newEvents.length} новых событий для уведомлений`);

    for (const eventLog of newEvents) {
      try {
        await sendAutoNotification(eventLog);
        processedEventIds.current.add(eventLog.event._id);
        console.log(`✅ Уведомление создано для события: ${eventLog.event.title}`);
        
        // Задержка между обработкой событий
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`❌ Ошибка создания уведомления для события ${eventLog.event.title}:`, error);
      }
    }
  }, [eventLogs]);

  // Эффект для обработки новых событий
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      processNewEvents();
    }, 1000); // Задержка для группировки событий

    return () => clearTimeout(timeoutId);
  }, [eventLogs, processNewEvents]);

  const sendMessage = useCallback(async (messageData: Omit<Message, '_id' | 'createdAt' | 'status'>) => {
    const newMessage: Message = {
      ...messageData,
      _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    // Добавляем в очередь для синхронной обработки
    setMessageQueue(prev => [...prev, newMessage]);

    console.log('📝 Сообщение добавлено в очередь:', {
      от: newMessage.senderName,
      кому: newMessage.recipientNames,
      тема: newMessage.subject,
      связано_с: newMessage.relatedTo?.type
    });
  }, []);

  const sendAutoNotification = useCallback(async (eventLog: EventLog) => {
    const event = eventLog.event;
    
    // Определяем получателей в зависимости от типа события
    let recipientIds: string[] = [];
    let recipientNames: string[] = [];

    if (event.type === 'personal') {
      // Персональная тренировка - уведомляем тренера и клиента
      recipientIds = [`trainer_${event.trainerId}`, `client_${event.clientId}`];
            recipientNames = [event.trainerName, event.clientName || 'Клиент'];
    } else {
      // Групповая тренировка - уведомляем всех тренеров
      recipientIds = ['trainer_1', 'trainer_2', 'trainer_3'];
      recipientNames = ['Тренер 1', 'Тренер 2', 'Тренер 3'];
    }

    // Всегда добавляем менеджеров и админов
    recipientIds.push('manager_1', 'admin_1');
    recipientNames.push('Менеджер', 'Администратор');

    const notificationContent = event.type === 'personal' 
      ? `Новая персональная тренировка!\n\n` +
        `📅 Дата: ${new Date(event.startTime).toLocaleDateString('ru')}\n` +
        `⏰ Время: ${new Date(event.startTime).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}\n` +
        `👤 Тренер: ${event.trainerName}\n` +
        `👥 Клиент: ${event.clientName}\n` +
        `💰 Стоимость: ${event.price} ₽\n\n` +
        `Пожалуйста, подтвердите участие.`
      : `Новая групповая тренировка!\n\n` +
        `📅 Дата: ${new Date(event.startTime).toLocaleDateString('ru')}\n` +
        `⏰ Время: ${new Date(event.startTime).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}\n` +
        `🏋️ Тип: ${event.title}\n` +
        `👤 Тренер: ${event.trainerName}\n` +
        `💰 Стоимость: ${event.price} ₽\n\n` +
        `Запись открыта для всех участников.`;

    await sendMessage({
      subject: `🏋️ ${event.type === 'personal' ? 'Персональная' : 'Групповая'} тренировка: ${event.title}`,
      content: notificationContent,
      senderId: 'system',
      senderName: 'Система уведомлений',
      senderRole: 'system',
      recipientIds,
      recipientNames,
      isRead: false,
      priority: 'normal',
      relatedTo: {
        type: 'event',
        id: event._id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        trainerName: event.trainerName,
        clientName: event.clientName,
        location: event.location,
        price: event.price
      }
    });
  }, [sendMessage]);

  const markAsRead = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId 
        ? { ...msg, isRead: true, status: 'read' }
        : msg
    ));

    console.log('👁️ Сообщение прочитано:', messageId);
  }, []);

  const logEvent = useCallback(async (eventLogData: Omit<EventLog, '_id' | 'timestamp'>) => {
    const newEventLog: EventLog = {
      ...eventLogData,
      _id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setEventLogs(prev => [...prev, newEventLog]);

    console.log('📝 Событие зарегистрировано:', {
      действие: newEventLog.action,
      создано: newEventLog.createdBy,
      событие: newEventLog.event.title,
      тип: newEventLog.event.type
    });
  }, []);

  const getDebugData = useCallback(() => {
    return {
      events: eventLogs,
      notifications: messages,
      syncStatus: {
        'super-admin': true,
        admin: true,
        manager: true,
        trainer: true,
        client: true
      }
    };
  }, [eventLogs, messages]);

  return (
    <MessagingContext.Provider value={{
      messages,
      eventLogs,
      messageQueue,
      isProcessingMessages,
      sendMessage,
      markAsRead,
      logEvent,
      getDebugData
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}

