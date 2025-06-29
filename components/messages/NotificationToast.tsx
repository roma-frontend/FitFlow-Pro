// components/messages/NotificationToast.tsx
"use client";

import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, Info, MessageCircle, Reply, Eye } from 'lucide-react';
import { Message } from '@/types/messages';

export interface NotificationToastProps {
  message: Message; // ← Changed from string to Message
  onClose: () => void;
  onView?: () => void;   // ← Added optional view handler
  onReply?: () => void;  // ← Added optional reply handler
}

export function NotificationToast({ message, onClose, onView, onReply }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000); // Increased to match NotificationManager timeout

    return () => clearTimeout(timer);
  }, [onClose]);

  const getPriorityIcon = () => {
    switch (message.priority) {
      case 'urgent':
        return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'high':
        return <Info className="h-5 w-5 text-orange-500 flex-shrink-0" />;
      case 'normal':
        return <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'normal':
        return 'bg-blue-50 border-blue-200';
      case 'low':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeLabel = () => {
    switch (message.type) {
      case 'direct':
        return 'Личное сообщение';
      case 'group':
        return 'Групповое сообщение';
      case 'announcement':
        return 'Объявление';
      case 'notification':
        return 'Уведомление';
      default:
        return 'Сообщение';
    }
  };

  return (
    <div className="max-w-sm w-full">
      <div className={`flex flex-col gap-2 p-4 border rounded-lg shadow-lg ${getBackgroundColor()} animate-in slide-in-from-right-2 duration-300`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getPriorityIcon()}
            <span className="text-xs font-medium text-gray-600">
              {getTypeLabel()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Закрыть уведомление"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            От: {message.senderName}
          </div>
          {message.subject && (
            <div className="text-sm font-medium text-gray-800">
              {message.subject}
            </div>
          )}
          <div className="text-sm text-gray-700 line-clamp-2">
            {message.content}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onView && (
            <button
              onClick={onView}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-3 w-3" />
              Просмотр
            </button>
          )}
          {onReply && message.type === 'direct' && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Reply className="h-3 w-3" />
              Ответить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
