// components/messages/MessageViewer.tsx (исправленная версия)
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Id } from '@/convex/_generated/dataModel';

interface MessageViewerProps {
  message: any;
  currentUserId: Id<"users">;
  onReply: (messageId: string) => void;
  onArchive: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onMarkAsRead: (messageId: string, userId: Id<"users">) => void;
}

export function MessageViewer({
  message,
  currentUserId,
  onReply,
  onArchive,
  onDelete,
  onMarkAsRead
}: MessageViewerProps) {
  if (!message) {
    return (
      <div className="border rounded-lg h-full">
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Выберите сообщение для просмотра</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg h-full">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              {message.subject || "Без темы"}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>От: {message.senderName}</span>
              <span>
                {new Date(message._creationTime).toLocaleString("ru")}
              </span>
              <Badge
                variant={
                  message.priority === "urgent"
                    ? "destructive"
                    : "outline"
                }
              >
                {message.priority}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReply(message._id)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Ответить
            </button>
            <button
              onClick={() => onArchive(message._id)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Архив
            </button>
            <button
              onClick={() => onDelete(message._id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Удалить
            </button>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">
            {message.content}
          </div>
        </div>

        {message.recipientNames && message.recipientNames.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Получатели:
            </h4>
            <div className="flex flex-wrap gap-2">
              {message.recipientNames.map((name: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs"
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
}
