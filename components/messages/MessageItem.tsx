// components/messages/MessageItem.tsx
"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Id } from '@/convex/_generated/dataModel';

export interface MessageItemProps {
  message: any;
  isSelected: boolean;
  isChecked: boolean;
  currentUserId: Id<"users">;
  onSelect: () => void;
  onToggle: () => void;
}

export function MessageItem({
  message,
  isSelected,
  isChecked,
  currentUserId,
  onSelect,
  onToggle
}: MessageItemProps) {
  const isUnread = !message.readAt?.[currentUserId];

  return (
    <div
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
        isSelected ? "bg-blue-50 border-blue-200" : ""
      } ${isChecked ? "bg-blue-100" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-sm ${isUnread ? "font-semibold" : "font-normal"}`}
            >
              {message.senderName}
            </span>
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            <Badge
              variant={
                message.priority === "urgent"
                  ? "destructive"
                  : "outline"
              }
              className="text-xs text-blue-600"
            >
              {message.type}
            </Badge>
          </div>

          <h4
            className={`text-sm truncate ${isUnread ? "font-medium" : "font-normal"}`}
          >
            {message.subject || "Без темы"}
          </h4>

          <p className="text-xs text-gray-500 truncate mt-1">
            {message.content}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            {new Date(message._creationTime).toLocaleString("ru")}
          </p>
        </div>
      </div>
    </div>
  );
}
