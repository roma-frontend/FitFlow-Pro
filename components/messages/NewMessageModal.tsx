// components/messages/NewMessageModal.tsx (исправленная версия)
import React from 'react';
import { X } from 'lucide-react';

interface NewMessageState {
  type: "direct" | "announcement" | "notification";
  subject: string;
  content: string;
  recipientIds: string[];
  priority: "low" | "normal" | "high" | "urgent";
  scheduledAt?: string;
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: NewMessageState;
  onSend: () => void;
  onChange: (message: NewMessageState) => void;
}

export function NewMessageModal({
  isOpen,
  onClose,
  message,
  onSend,
  onChange
}: NewMessageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Новое сообщение</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Тип сообщения */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Тип сообщения
              </label>
              <select
                value={message.type}
                onChange={(e) =>
                  onChange({
                    ...message,
                    type: e.target.value as NewMessageState["type"],
                    recipientIds: [],
                  })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="direct">Личное сообщение</option>
                <option value="announcement">Объявление</option>
                <option value="notification">Уведомление</option>
              </select>
            </div>

            {/* Приоритет */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Приоритет
              </label>
              <select
                value={message.priority}
                onChange={(e) =>
                  onChange({
                    ...message,
                    priority: e.target.value as NewMessageState["priority"],
                  })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Низкий</option>
                <option value="normal">Обычный</option>
                <option value="high">Высокий</option>
                <option value="urgent">Срочный</option>
              </select>
            </div>

            {/* Получатели для личных сообщений */}
            {message.type === "direct" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Получатели
                </label>
                <input
                  type="text"
                  placeholder="Введите ID получателей через запятую (например: user1, user2)"
                  value={message.recipientIds.join(", ")}
                  onChange={(e) =>
                    onChange({
                      ...message,
                      recipientIds: e.target.value
                        .split(",")
                        .map((id) => id.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  В демо-режиме используйте: user1, user2, user3, trainer1, trainer2
                </p>
              </div>
            )}

            {/* Тема */}
            <div>
              <label className="block text-sm font-medium mb-2">Тема</label>
              <input
                type="text"
                value={message.subject}
                onChange={(e) =>
                  onChange({
                    ...message,
                    subject: e.target.value,
                  })
                }
                placeholder="Введите тему сообщения"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Содержимое */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Сообщение *
              </label>
              <textarea
                value={message.content}
                onChange={(e) =>
                  onChange({
                    ...message,
                    content: e.target.value,
                  })
                }
                placeholder="Введите текст сообщения..."
                rows={6}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{message.content.length} символов</span>
              </div>
            </div>

            {/* Планирование отправки */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Запланировать отправку (необязательно)
              </label>
              <input
                type="datetime-local"
                value={message.scheduledAt || ""}
                onChange={(e) =>
                  onChange({
                    ...message,
                    scheduledAt: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <button
                onClick={onSend}
                disabled={!message.content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {message.scheduledAt ? 'Запланировать' : 'Отправить'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 ml-auto"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
