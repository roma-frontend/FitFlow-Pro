// app/admin/messages/page.tsx (исправленная версия)
"use client";

import React, { useState, useCallback } from "react";

// Импорты хуков
import { useMessages } from "@/hooks/useMessages";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Id } from "@/convex/_generated/dataModel";

// Импорты компонентов messages
import { BulkActions } from "@/components/messages/BulkActions";
import { ExportDialog } from "@/components/messages/ExportDialog";
import { MessagesFilters } from "@/components/messages/MessagesFilters";
import { MessagesList } from "@/components/messages/MessagesList";
import { MessageViewer } from "@/components/messages/MessageViewer";
import { NewMessageModal } from "@/components/messages/NewMessageModal";
import { MessageHeader } from "@/components/messages/MessageHeader";
import { SimpleToast } from "@/components/ui/SimpleToast";
import { MessagesPageSkeleton } from "@/components/messages/MessagesPageSkeleton";

// Определяем правильный тип для нового сообщения
interface NewMessageState {
  type: "direct" | "announcement" | "notification";
  subject: string;
  content: string;
  recipientIds: string[];
  priority: "low" | "normal" | "high" | "urgent";
  scheduledAt?: string;
}

export default function MessagesPage() {
  // Хуки для данных
  const currentUserId = "user1" as Id<"users">;

  const {
    messages,
    unreadCount,
    loading: messagesLoading,
    loadMessages,
    markAsRead,
    archiveMessage,
    deleteMessage,
    bulkArchive,
    bulkDelete,
    bulkMarkAsRead,
    sendMessage,
    apiAvailable: messagesApiAvailable,
  } = useMessages(currentUserId);

  // Состояние UI
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

  // Состояние нового сообщения
  const [newMessage, setNewMessage] = useState<NewMessageState>({
    type: "direct",
    subject: "",
    content: "",
    recipientIds: [],
    priority: "normal",
    scheduledAt: undefined,
  });

  // Функция для показа уведомлений
  const showNotification = useCallback(
    (type: "success" | "error" | "info", text: string) => {
      setNotification({ type, text });
      setTimeout(() => setNotification(null), 5000);
    },
    []
  );

  // Обработчики сообщений
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

  // Обработчики массовых операций
  const handleSelectAll = useCallback(() => {
    setSelectedMessages(messages.map((m) => m._id));
  }, [messages]);

  const handleDeselectAll = useCallback(() => {
    setSelectedMessages([]);
  }, []);

  const handleBulkArchive = useCallback(async () => {
    try {
      await bulkArchive(selectedMessages);
      setSelectedMessages([]);
      showNotification(
        "success",
        `Архивировано сообщений: ${selectedMessages.length}`
      );
    } catch (error) {
      console.error("Ошибка архивирования:", error);
      showNotification("error", "Ошибка при архивировании сообщений");
    }
  }, [bulkArchive, selectedMessages, showNotification]);

  const handleBulkDelete = useCallback(async () => {
    if (
      !confirm(
        `Удалить ${selectedMessages.length} сообщений? Это действие нельзя отменить.`
      )
    ) {
      return;
    }

    try {
      await bulkDelete(selectedMessages);
      setSelectedMessages([]);
      showNotification(
        "success",
        `Удалено сообщений: ${selectedMessages.length}`
      );
    } catch (error) {
      console.error("Ошибка удаления:", error);
      showNotification("error", "Ошибка при удалении сообщений");
    }
  }, [bulkDelete, selectedMessages, showNotification]);

  const handleBulkMarkAsRead = useCallback(async () => {
    try {
      await bulkMarkAsRead(selectedMessages, currentUserId);
      setSelectedMessages([]);
      showNotification(
        "success",
        `Отмечено как прочитанное: ${selectedMessages.length} сообщений`
      );
    } catch (error) {
      console.error("Ошибка отметки как прочитанное:", error);
      showNotification("error", "Ошибка при отметке сообщений как прочитанные");
    }
  }, [bulkMarkAsRead, selectedMessages, currentUserId, showNotification]);

  // Обработчики просмотра сообщений
  const handleMessageView = useCallback(
    (messageId: string) => {
      const foundMessage = messages.find((m) => m._id === messageId);
      if (foundMessage) {
        setSelectedMessage(foundMessage);
        markAsRead(messageId, currentUserId);
      }
    },
    [messages, markAsRead, currentUserId]
  );

  const handleMessageReply = useCallback(
    (messageId: string) => {
      const foundMessage = messages.find((m) => m._id === messageId);
      if (foundMessage) {
        setNewMessage((prev) => ({
          ...prev,
          type: "direct",
          recipientIds: [foundMessage.senderId],
          subject: `Re: ${foundMessage.subject || "Сообщение"}`,
          content: `\n\n--- Исходное сообщение ---\nОт: ${foundMessage.senderName}\nДата: ${new Date(foundMessage._creationTime).toLocaleString("ru")}\n\n${foundMessage.content}`,
        }));
        setShowNewMessage(true);
      }
    },
    [messages]
  );

  // Фильтрация сообщений
  const filteredMessages = messages.filter((msg) => {
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

  if (messagesLoading) {
    return <MessagesPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Статус API */}
      {!messagesApiAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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

      {/* Заголовок */}
      <MessageHeader
        title="Сообщения"
        subtitle="Управление сообщениями пользователей"
        showBackButton={false}
        showActions={true}
        onBack={() => {}}
        onTitleClick={() => {}}
        onCall={() => {}}
        onVideoCall={() => {}}
        onSearch={() => setSearchTerm("")}
        onMenu={() => {}}
      />

      <div className="space-y-4">
        {/* Фильтры и поиск */}
        <MessagesFilters
          searchTerm={searchTerm}
          filterType={filterType}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onTypeChange={setFilterType}
          onStatusChange={setFilterStatus}
        />

        {/* Список сообщений */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая панель - список сообщений */}
          <div className="lg:col-span-1">
            <MessagesList
              messages={filteredMessages}
              selectedMessage={selectedMessage}
              selectedMessages={selectedMessages}
              currentUserId={currentUserId}
              onMessageSelect={handleMessageView}
              onMessageToggle={(messageId: string) => {
                if (selectedMessages.includes(messageId)) {
                  setSelectedMessages((prev) =>
                    prev.filter((id) => id !== messageId)
                  );
                } else {
                  setSelectedMessages((prev) => [...prev, messageId]);
                }
              }}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
          </div>

          {/* Правая панель - просмотр сообщения */}
          <div className="lg:col-span-2">
            <MessageViewer
              message={selectedMessage}
              currentUserId={currentUserId}
              onReply={handleMessageReply}
              onArchive={archiveMessage}
              onDelete={(messageId: string) => {
                if (confirm("Удалить сообщение?")) {
                  deleteMessage(messageId);
                  setSelectedMessage(null);
                }
              }}
              onMarkAsRead={markAsRead}
            />
          </div>
        </div>
      </div>

      {/* Модальное окно создания сообщения */}
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

      {/* Модальное окно экспорта */}
      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        messages={
          selectedMessages.length > 0
            ? messages.filter((m) => selectedMessages.includes(m._id))
            : filteredMessages
        }
        selectedCount={selectedMessages.length}
        totalCount={messages.length}
        unreadCount={unreadCount}
        archivedCount={messages.filter((m) => m.isArchived).length}
        onExport={(format: string, options: any) => {
          const exportData =
            selectedMessages.length > 0
              ? messages.filter((m) => selectedMessages.includes(m._id))
              : filteredMessages;

          // Простая реализация CSV экспорта
          if (format === "csv") {
            const csvData = exportData.map((msg) => ({
              id: msg._id,
              type: msg.type,
              subject: msg.subject || "Без темы",
              sender: msg.senderName,
              content: msg.content.substring(0, 100) + "...",
              date: new Date(msg._creationTime).toLocaleString("ru"),
              priority: msg.priority,
              status: msg.status,
            }));

            const csvContent = [
              "ID,Тип,Тема,Отправитель,Содержание,Дата,Приоритет,Статус",
              ...csvData.map(
                (row) =>
                  `"${row.id}","${row.type}","${row.subject}","${row.sender}","${row.content}","${row.date}","${row.priority}","${row.status}"`
              ),
            ].join("\n");

            const blob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `messages_export_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
          }

          setShowExport(false);
          showNotification(
            "success",
            `Экспорт в формате ${format.toUpperCase()} завершен!`
          );
        }}
      />

      {/* Панель массовых операций */}
      {selectedMessages.length > 0 && (
        <BulkActions
          selectedCount={selectedMessages.length}
          onMarkAsRead={handleBulkMarkAsRead}
          onArchive={handleBulkArchive}
          onDelete={handleBulkDelete}
          onExport={() => setShowExport(true)}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      )}

      {/* Уведомления */}
      {notification && (
        <SimpleToast
          type={notification.type}
          message={notification.text}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
