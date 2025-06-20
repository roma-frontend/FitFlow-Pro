// app/admin/messages/components/MessagesPageSkeleton.tsx
"use client";

import React from 'react';

export const MessagesPageSkeleton = React.memo(() => {
  return (
    <div className="space-y-6">
      {/* API Status Skeleton */}
      <ApiStatusSkeleton />

      {/* Message Header Skeleton */}
      <MessageHeaderSkeleton />

      <div className="space-y-4">
        {/* Filters Skeleton */}
        <MessagesFiltersSkeleton />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Messages List */}
          <div className="lg:col-span-1">
            <MessagesListSkeleton />
          </div>

          {/* Right Panel - Message Viewer */}
          <div className="lg:col-span-2">
            <MessageViewerSkeleton />
          </div>
        </div>
      </div>

      {/* Bulk Actions Skeleton */}
      <BulkActionsSkeleton />
    </div>
  );
});

// API Status Skeleton
const ApiStatusSkeleton = React.memo(() => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-200 rounded-full"></div>
        <div className="h-4 bg-yellow-200 rounded w-32"></div>
      </div>
      <div className="h-3 bg-yellow-100 rounded w-64 mt-1"></div>
    </div>
  );
});

// Message Header Skeleton
const MessageHeaderSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and subtitle */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-100 rounded w-48 animate-pulse"></div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-10 h-10 bg-blue-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
});

// Messages Filters Skeleton
const MessagesFiltersSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search bar */}
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full"></div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
      </div>
    </div>
  );
});

// Messages List Skeleton
const MessagesListSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 8 }).map((_, index) => (
          <MessageItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
});

// Individual Message Item Skeleton
const MessageItemSkeleton = React.memo(() => {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors animate-pulse">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>

        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-100 rounded w-16"></div>
            </div>
          </div>

          {/* Subject */}
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>

          {/* Preview */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-100 rounded w-full"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-blue-200 rounded-full"></div>
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Message Viewer Skeleton
const MessageViewerSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Message details */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-5 w-16 bg-blue-200 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Message content */}
      <div className="p-4 flex-1">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Attachments placeholder */}
        <div className="mt-6 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Reply section */}
      <div className="p-4 border-t border-gray-200">
        <div className="h-10 bg-blue-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  );
});

// Bulk Actions Skeleton
const BulkActionsSkeleton = React.memo(() => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-red-200 rounded"></div>
          <div className="h-8 w-20 bg-blue-200 rounded"></div>
        </div>
      </div>
    </div>
  );
});

// Compact version for mobile
export const CompactMessagesPageSkeleton = React.memo(() => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="w-10 h-10 bg-blue-200 rounded-lg"></div>
        </div>
      </div>

      {/* Search */}
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>

      {/* Messages */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-100 rounded w-12"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Display names
ApiStatusSkeleton.displayName = 'ApiStatusSkeleton';
MessageHeaderSkeleton.displayName = 'MessageHeaderSkeleton';
MessagesFiltersSkeleton.displayName = 'MessagesFiltersSkeleton';
MessagesListSkeleton.displayName = 'MessagesListSkeleton';
MessageItemSkeleton.displayName = 'MessageItemSkeleton';
MessageViewerSkeleton.displayName = 'MessageViewerSkeleton';
BulkActionsSkeleton.displayName = 'BulkActionsSkeleton';
MessagesPageSkeleton.displayName = 'MessagesPageSkeleton';
CompactMessagesPageSkeleton.displayName = 'CompactMessagesPageSkeleton';

// Exports
export {
  ApiStatusSkeleton,
  MessageHeaderSkeleton,
  MessagesFiltersSkeleton,
  MessagesListSkeleton,
  MessageItemSkeleton,
  MessageViewerSkeleton,
  BulkActionsSkeleton
};
