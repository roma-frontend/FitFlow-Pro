// components/messages/MessagesList.tsx
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { Id } from '@/convex/_generated/dataModel';

interface MessagesListProps {
  messages: any[];
  selectedMessage: any;
  selectedMessages: string[];
  currentUserId: Id<"users">;
  onMessageSelect: (messageId: string) => void;
  onMessageToggle: (messageId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function MessagesList({
  messages,
  selectedMessage,
  selectedMessages,
  currentUserId,
  onMessageSelect,
  onMessageToggle,
  onSelectAll,
  onDeselectAll
}: MessagesListProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Заголовок */}
      <div className="p-3 sm:p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm sm:text-base truncate">
            Сообщения ({messages.length})
          </h3>
          {selectedMessages.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs sm:text-sm text-blue-600 whitespace-nowrap">
                Выбрано: {selectedMessages.length}
              </span>
              <button
                onClick={onDeselectAll}
                className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Отменить
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Список сообщений */}
      <div className="max-h-64 sm:max-h-96 overflow-y-auto overflow-x-clip">
        {messages.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">Сообщения не найдены</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isSelected={selectedMessage?._id === message._id}
                isChecked={selectedMessages.includes(message._id)}
                currentUserId={currentUserId}
                onSelect={() => onMessageSelect(message._id)}
                onToggle={() => onMessageToggle(message._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
