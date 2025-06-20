// app/admin/schedule/components/SchedulePageSkeleton.tsx
"use client";

import React from 'react';

export const SchedulePageSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Skeleton */}
      <ScheduleHeaderSkeleton />
      
      {/* Notifications Skeleton */}
      <ScheduleNotificationsSkeleton />
      
      {/* Stats Skeleton */}
      <ScheduleStatsSkeleton />
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Tabs Skeleton */}
        <ScheduleTabsSkeleton />
        
        {/* Content Area */}
        <div className="mt-6">
          <ScheduleContentSkeleton />
        </div>
      </div>
    </div>
  );
});

// Header Skeleton
const ScheduleHeaderSkeleton = React.memo(() => {
  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Calendar icon skeleton */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gray-200 border-2 border-white animate-pulse"></div>
            </div>

            {/* Title and subtitle */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-6 sm:h-7 lg:h-8 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse hidden sm:block"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse hidden sm:block"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse hidden sm:block"></div>
            <div className="w-10 h-10 bg-blue-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
});

// Notifications Skeleton
const ScheduleNotificationsSkeleton = React.memo(() => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* API Status notification */}
      <div className="border border-green-200 bg-green-50 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-200 rounded animate-pulse"></div>
          <div className="h-4 bg-green-200 rounded animate-pulse w-64"></div>
        </div>
      </div>
    </div>
  );
});

// Stats Skeleton
const ScheduleStatsSkeleton = React.memo(() => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-8"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Tabs Skeleton
const ScheduleTabsSkeleton = React.memo(() => {
  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 p-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div 
            key={index} 
            className={`h-10 rounded-md animate-pulse flex items-center justify-center gap-2 ${
              index === 0 ? 'bg-blue-200' : 'bg-gray-200'
            }`}
          >
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Content Skeleton (Calendar view by default)
const ScheduleContentSkeleton = React.memo(() => {
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Calendar Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
            <div key={index} className="h-8 bg-gray-100 rounded animate-pulse flex items-center justify-center">
              <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <CalendarDaySkeleton key={index} hasEvents={Math.random() > 0.7} />
          ))}
        </div>
      </div>
    </div>
  );
});

// Calendar Day Skeleton
const CalendarDaySkeleton = React.memo(({ hasEvents }: { hasEvents: boolean }) => {
  return (
    <div className="aspect-square border border-gray-100 p-1 hover:bg-gray-50 transition-colors">
      <div className="h-full flex flex-col">
        {/* Day number */}
        <div className="h-6 flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Events */}
        {hasEvents && (
          <div className="flex-1 space-y-1 mt-1">
            <div className="h-2 bg-blue-200 rounded animate-pulse"></div>
            {Math.random() > 0.5 && (
              <div className="h-2 bg-green-200 rounded animate-pulse"></div>
            )}
            {Math.random() > 0.7 && (
              <div className="h-2 bg-purple-200 rounded animate-pulse"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Alternative: List View Skeleton
export const ScheduleListSkeleton = React.memo(() => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border p-4 shadow-sm animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Title and badges */}
              <div className="flex items-center space-x-3">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-6 w-20 bg-blue-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
              
              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <div className="h-8 w-20 bg-blue-200 rounded"></div>
              <div className="h-8 w-16 bg-red-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// Alternative: Analytics View Skeleton
export const ScheduleAnalyticsSkeleton = React.memo(() => {
  return (
    <div className="space-y-6">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Large chart area */}
      <div className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
});

// Display names
ScheduleHeaderSkeleton.displayName = 'ScheduleHeaderSkeleton';
ScheduleNotificationsSkeleton.displayName = 'ScheduleNotificationsSkeleton';
ScheduleStatsSkeleton.displayName = 'ScheduleStatsSkeleton';
ScheduleTabsSkeleton.displayName = 'ScheduleTabsSkeleton';
ScheduleContentSkeleton.displayName = 'ScheduleContentSkeleton';
CalendarDaySkeleton.displayName = 'CalendarDaySkeleton';
SchedulePageSkeleton.displayName = 'SchedulePageSkeleton';

// Exports
export {
  ScheduleHeaderSkeleton,
  ScheduleNotificationsSkeleton,
  ScheduleStatsSkeleton,
  ScheduleTabsSkeleton,
  ScheduleContentSkeleton,
  CalendarDaySkeleton
};
