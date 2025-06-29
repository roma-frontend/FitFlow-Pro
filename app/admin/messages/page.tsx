// app/admin/messages/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useMessages } from "@/hooks/useMessages";
import { Id } from "@/convex/_generated/dataModel";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Компоненты
import MessagesLayout from "@/components/messages/MessagesLayout";
import MessagesFilters from "@/components/messages/MessagesFilters";
import MessageHeader from "@/components/messages/MessageHeader";
import { MessagesPageSkeleton } from "@/components/messages/MessagesPageSkeleton";
import { SimpleToast } from "@/components/ui/SimpleToast";
import { NewMessageModal } from "@/components/messages/NewMessageModal";

// Определяем тип для нового сообщения
interface NewMessageState {
  type: "direct" | "announcement" | "notification";
  subject: string;
  content: string;
  recipientIds: string[];
  priority: "low" | "normal" | "high" | "urgent";
  scheduledAt?: string;
}

export default function MessagesPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1023px)");
  
  const currentUserId = "user1" as Id<"users">;
  const {
    messages,
    unreadCount,
    loading: messagesLoading,
    markAsRead,
    archiveMessage,
    deleteMessage,
    bulkArchive,
    bulkDelete,
    bulkMarkAsRead,
    sendMessage,
    apiAvailable: messagesApiAvailable,
  } = useMessages(currentUserId);

  // Состояния
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  
  // Добавлено состояние для нового сообщения
  const [newMessage, setNewMessage] = useState<NewMessageState>({
    type: "direct",
    subject: "",
    content: "",
    recipientIds: [],
    priority: "normal",
    scheduledAt: undefined,
  });

  // Показ уведомлений
  const showNotification = useCallback(
    (type: "success" | "error" | "info", text: string) => {
      setNotification({ type, text });
      setTimeout(() => setNotification(null), 5000);
    },
    []
  );

  // Обработка отправки сообщения
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.content.trim()) {
      showNotification("error", "Введите текст сообщения");
      return;
    }

    if (newMessage.type === "direct" && newMessage.recipientIds.length === 0) {
      showNotification("error", "Выберите получателей для личного сообщения");
      return;
    }

    try {
      await sendMessage({
        type: newMessage.type,
        subject: newMessage.subject,
        content: newMessage.content,
        senderId: currentUserId,
        senderName: "Текущий пользователь",
        recipientIds: newMessage.recipientIds as Id<"users">[],
        recipientNames: [],
        priority: newMessage.priority,
        scheduledAt: newMessage.scheduledAt
          ? new Date(newMessage.scheduledAt).getTime()
          : undefined,
      });

      setNewMessage({
        type: "direct",
        subject: "",
        content: "",
        recipientIds: [],
        priority: "normal",
        scheduledAt: undefined,
      });
      setShowNewMessage(false);

      showNotification("success", "Сообщение отправлено успешно!");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      showNotification("error", "Ошибка при отправке сообщения");
    }
  }, [newMessage, sendMessage, currentUserId, showNotification]);

  // Обработка выбора сообщения
  const handleMessageView = useCallback(
    (messageId: string) => {
      const foundMessage = messages.find((m) => m._id === messageId);
      if (foundMessage) {
        setSelectedMessage(foundMessage);
        markAsRead(messageId, currentUserId);
        if (isMobile) setMobileView("detail");
      }
    },
    [messages, markAsRead, currentUserId, isMobile]
  );

  // Обработка возврата к списку на мобильных
  const handleBackToList = useCallback(() => {
    setSelectedMessage(null);
    if (isMobile) setMobileView("list");
  }, [isMobile]);

  // Фильтрация сообщений
  const filteredMessages = React.useMemo(() => {
    return messages.filter((msg) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          msg.content.toLowerCase().includes(searchLower) ||
          msg.subject?.toLowerCase().includes(searchLower) ||
          msg.senderName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filterType !== "all" && msg.type !== filterType) return false;

      if (filterStatus !== "all") {
        if (filterStatus === "unread") {
          const readAt = msg.readAt || {};
          if (readAt[currentUserId]) return false;
        } else if (filterStatus === "read") {
          const readAt = msg.readAt || {};
          if (!readAt[currentUserId]) return false;
        } else if (filterStatus === "archived") {
          if (!msg.isArchived) return false;
        }
      }

      return true;
    });
  }, [messages, searchTerm, filterType, filterStatus, currentUserId]);

  if (messagesLoading) {
    return <MessagesPageSkeleton />;
  }

  return (
    <>
      {/* Статус API */}
      {!messagesApiAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-800">
              Режим демонстрации
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Convex API недоступен. Используются тестовые данные.
          </p>
        </div>
      )}

      <MessageHeader
        title="Сообщения"
        subtitle="Управление сообщениями пользователей"
        showBackButton={isMobile && mobileView === "detail"}
        onBack={handleBackToList}
      />

      <MessagesFilters
        searchTerm={searchTerm}
        filterType={filterType}
        filterStatus={filterStatus}
        onSearchChange={setSearchTerm}
        onTypeChange={setFilterType}
        onStatusChange={setFilterStatus}
      />

      <MessagesLayout
        messages={filteredMessages}
        selectedMessage={selectedMessage}
        selectedMessages={selectedMessages}
        currentUserId={currentUserId}
        unreadCount={unreadCount}
        mobileView={mobileView}
        isMobile={isMobile}
        isTablet={isTablet}
        onMessageSelect={handleMessageView}
        onMessageToggle={(messageId) => {
          setSelectedMessages(prev => 
            prev.includes(messageId) 
              ? prev.filter(id => id !== messageId) 
              : [...prev, messageId]
          );
        }}
        onSelectAll={() => setSelectedMessages(filteredMessages.map(m => m._id))}
        onDeselectAll={() => setSelectedMessages([])}
        onArchive={archiveMessage}
        onDelete={(messageId) => {
          deleteMessage(messageId);
          if (selectedMessage?._id === messageId) {
            setSelectedMessage(null);
            if (isMobile) setMobileView("list");
          }
        }}
        onMarkAsRead={markAsRead}
        onReply={(message) => {
          setNewMessage({
            type: "direct",
            subject: `Re: ${message.subject || "Сообщение"}`,
            content: `\n\n--- Исходное сообщение ---\nОт: ${message.senderName}\nДата: ${new Date(message._creationTime).toLocaleString("ru")}\n\n${message.content}`,
            recipientIds: [message.senderId],
            priority: "normal",
            scheduledAt: undefined,
          });
          setShowNewMessage(true);
        }}
        onBulkArchive={async () => {
          try {
            await bulkArchive(selectedMessages);
            setSelectedMessages([]);
            showNotification("success", `Архивировано: ${selectedMessages.length} сообщ.`);
          } catch (error) {
            showNotification("error", "Ошибка архивирования");
          }
        }}
        onBulkDelete={async () => {
          try {
            await bulkDelete(selectedMessages);
            setSelectedMessages([]);
            showNotification("success", `Удалено: ${selectedMessages.length} сообщ.`);
          } catch (error) {
            showNotification("error", "Ошибка удаления");
          }
        }}
        onBulkMarkAsRead={async () => {
          try {
            await bulkMarkAsRead(selectedMessages, currentUserId);
            setSelectedMessages([]);
            showNotification("success", `Отмечено как прочитанное: ${selectedMessages.length} сообщ.`);
          } catch (error) {
            showNotification("error", "Ошибка отметки как прочитанные");
          }
        }}
        onExport={() => setShowExport(true)}
        showNewMessage={() => setShowNewMessage(true)}
      />

      {/* Модальное окно нового сообщения */}
      <NewMessageModal
        isOpen={showNewMessage}
        onClose={() => {
          setShowNewMessage(false);
          setNewMessage({
            type: "direct",
            subject: "",
            content: "",
            recipientIds: [],
            priority: "normal",
            scheduledAt: undefined,
          });
        }}
        message={newMessage}
        onSend={handleSendMessage}
        onChange={setNewMessage}
      />

      {/* Уведомления */}
      {notification && (
        <SimpleToast
          type={notification.type}
          message={notification.text}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}