// components/messages/MessagesLayout.tsx
import React from 'react';
import { Id } from '@/convex/_generated/dataModel';
import MessagesList from './MessagesList';
import MessageViewer from './MessageViewer';
import BulkActions from './BulkActions';

interface MessagesLayoutProps {
  messages: any[];
  selectedMessage: any;
  selectedMessages: string[];
  currentUserId: Id<"users">;
  unreadCount: number;
  mobileView: 'list' | 'detail';
  isMobile: boolean;
  isTablet: boolean;
  
  // Обработчики
  onMessageSelect: (messageId: string) => void;
  onMessageToggle: (messageId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onArchive: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onMarkAsRead: (messageId: string, userId: Id<"users">) => void;
  onReply: (message: any) => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkMarkAsRead: () => void;
  onExport: () => void;
  showNewMessage: () => void;
}

const MessagesLayout: React.FC<MessagesLayoutProps> = ({
  messages,
  selectedMessage,
  selectedMessages,
  currentUserId,
  unreadCount,
  mobileView,
  isMobile,
  isTablet,
  onMessageSelect,
  onMessageToggle,
  onSelectAll,
  onDeselectAll,
  onArchive,
  onDelete,
  onMarkAsRead,
  onReply,
  onBulkArchive,
  onBulkDelete,
  onBulkMarkAsRead,
  onExport,
  showNewMessage
}) => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Список сообщений */}
        <div className={`
          ${isMobile && mobileView === 'detail' ? 'hidden' : 'block'} 
          ${isTablet ? 'col-span-1' : 'lg:col-span-1'}
        `}>
          <MessagesList
            messages={messages}
            selectedMessage={selectedMessage}
            selectedMessages={selectedMessages}
            currentUserId={currentUserId}
            onMessageSelect={onMessageSelect}
            onMessageToggle={onMessageToggle}
          />
        </div>

        {/* Детали сообщения */}
        <div className={`
          ${isMobile && mobileView === 'list' ? 'hidden' : 'block'} 
          ${isTablet ? 'col-span-1' : 'lg:col-span-2'}
        `}>
          <MessageViewer
            message={selectedMessage}
            currentUserId={currentUserId}
            onReply={onReply}
            onArchive={onArchive}
            onDelete={onDelete}
            onMarkAsRead={onMarkAsRead}
            onBack={isMobile ? () => onMessageSelect('') : undefined}
          />
        </div>
      </div>

      {/* Панель массовых действий */}
      {selectedMessages.length > 0 && (
        <BulkActions
          selectedCount={selectedMessages.length}
          onMarkAsRead={onBulkMarkAsRead}
          onArchive={onBulkArchive}
          onDelete={onBulkDelete}
          onExport={onExport}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          isMobile={isMobile}
        />
      )}

      {/* Кнопка нового сообщения для мобильных */}
      {isMobile && (
        <button
          onClick={showNewMessage}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg z-50"
          aria-label="Новое сообщение"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessagesLayout;