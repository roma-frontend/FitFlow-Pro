// components/messages/MessageViewer.tsx
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';

interface MessageViewerProps {
  message: any;
  currentUserId: Id<"users">;
  onReply: (message: any) => void;
  onArchive: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onMarkAsRead: (messageId: string, userId: Id<"users">) => void;
  onBack?: () => void;
}

const MessageViewer: React.FC<MessageViewerProps> = memo(({
  message,
  currentUserId,
  onReply,
  onArchive,
  onDelete,
  onMarkAsRead,
  onBack
}) => {
  if (!message) {
    return (
      <div className="border rounded-lg h-full flex items-center justify-center">
        <div className="text-center p-6 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p>Выберите сообщение для просмотра</p>
        </div>
      </div>
    );
  }

  const date = new Date(message._creationTime);
  const formattedDate = date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="border rounded-lg h-full flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        {onBack && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-2 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </Button>
        )}
        
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold mb-2 line-clamp-1">
              {message.subject || "Без темы"}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>От: {message.senderName}</span>
              <span>{formattedDate}</span>
              <Badge
                variant={
                  message.priority === "urgent" ? "destructive" : 
                  message.priority === "high" ? "warning" : "outline"
                }
              >
                {message.priority}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => onReply(message)}
              variant="outline"
              size="sm"
            >
              Ответить
            </Button>
            <Button
              onClick={() => onArchive(message._id)}
              variant="outline"
              size="sm"
            >
              Архив
            </Button>
            <Button
              onClick={() => onDelete(message._id)}
              variant="destructive"
              size="sm"
            >
              Удалить
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">
            {message.content}
          </div>
        </div>

        {message.recipientNames?.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Получатели:
            </h4>
            <div className="flex flex-wrap gap-2">
              {message.recipientNames.map((name: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs py-1 px-2"
                >
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageViewer;