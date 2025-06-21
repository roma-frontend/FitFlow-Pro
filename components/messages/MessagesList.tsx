// components/messages/MessagesList.tsx
import React, { memo } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import MessageItem from './MessageItem';

interface MessagesListProps {
  messages: any[];
  selectedMessage: any;
  selectedMessages: string[];
  currentUserId: Id<"users">;
  onMessageSelect: (messageId: string) => void;
  onMessageToggle: (messageId: string) => void;
}

const MessagesList: React.FC<MessagesListProps> = memo(({
  messages,
  selectedMessage,
  selectedMessages,
  currentUserId,
  onMessageSelect,
  onMessageToggle
}) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm sm:text-base">
            Сообщения ({messages.length})
          </h3>
          {selectedMessages.length > 0 && (
            <span className="text-xs text-blue-600">
              Выбрано: {selectedMessages.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="mx-auto mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p>Сообщения не найдены</p>
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
});

export default MessagesList;