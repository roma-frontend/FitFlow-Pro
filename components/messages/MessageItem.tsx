// components/messages/MessageItem.tsx
import React, { memo } from 'react';
import { Id } from '@/convex/_generated/dataModel';

interface MessageItemProps {
  message: any;
  isSelected: boolean;
  isChecked: boolean;
  currentUserId: Id<"users">;
  onSelect: () => void;
  onToggle: () => void;
}

const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  isSelected,
  isChecked,
  currentUserId,
  onSelect,
  onToggle
}) => {
  const isUnread = !message.readAt?.[currentUserId];
  const date = new Date(message._creationTime);
  const formattedDate = date.toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className={`
        p-3 transition-colors cursor-pointer
        ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div 
          className="mt-1 flex-shrink-0" 
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {}}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`font-medium truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {message.senderName}
              </span>
              {isUnread && (
                <span className="flex-shrink-0 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              )}
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
          
          <h4 className={`truncate mt-1 text-sm ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {message.subject || 'Без темы'}
          </h4>
          
          <p className="text-xs text-gray-500 mt-1 truncate">
            {message.content.substring(0, 100)}
          </p>
        </div>
      </div>
    </div>
  );
});

export default MessageItem;