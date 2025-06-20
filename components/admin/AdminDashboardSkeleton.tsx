// app/admin/components/AdminDashboardSkeleton.tsx
"use client";

import React from 'react';

export const AdminDashboardSkeleton = React.memo(() => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Welcome Header Skeleton */}
          <WelcomeHeaderSkeleton />

          {/* Status Cards Skeleton */}
          <StatusCardsSkeleton />

          {/* Personalized Stats Skeleton */}
          <PersonalizedStatsSkeleton />

          {/* Quick Actions & Progress Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActionsSkeleton />
            <PersonalizedProgressSkeleton />
          </div>

          {/* Recent Activity & Role Tips Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivitySkeleton />
            </div>
            <RoleTipsSkeleton />
          </div>

          {/* Role Specific Widgets */}
          <RoleSpecificWidgetsSkeleton />

          {/* Additional Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuickStatsWidgetSkeleton />
            <NotificationsWidgetSkeleton />
            <QuickLinksWidgetSkeleton />
          </div>

          {/* Key Metrics */}
          <KeyMetricsSkeleton />

          {/* Weekly Calendar */}
          <WeeklyCalendarSkeleton />

          {/* Progress Tracker */}
          <ProgressTrackerSkeleton />

          {/* Footer */}
          <DashboardFooterSkeleton />
        </div>
      </main>
    </div>
  );
});

// Welcome Header Skeleton
const WelcomeHeaderSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        {/* Left side - User info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="h-5 bg-gray-100 rounded animate-pulse w-32"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-20 h-10 bg-red-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
});

// Status Cards Skeleton
const StatusCardsSkeleton = React.memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="mt-4 h-3 bg-gray-100 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
});

// Personalized Stats Skeleton
const PersonalizedStatsSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-16 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Quick Actions Skeleton
const QuickActionsSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-200 rounded w-28 mb-6 animate-pulse"></div>
      
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="space-y-1 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Personalized Progress Skeleton
const PersonalizedProgressSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-200 rounded w-24 mb-6 animate-pulse"></div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full bg-gray-300 rounded-full animate-pulse`} style={{ width: `${Math.random() * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Recent Activity Skeleton
const RecentActivitySkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Role Tips Skeleton
const RoleTipsSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-200 rounded w-20 mb-4 animate-pulse"></div>
      
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-3 bg-blue-50 rounded-lg animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-200 rounded"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-blue-200 rounded w-full"></div>
                <div className="h-3 bg-blue-100 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Role Specific Widgets Skeleton
const RoleSpecificWidgetsSkeleton = React.memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// Quick Stats Widget Skeleton
const QuickStatsWidgetSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-8"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Notifications Widget Skeleton
const NotificationsWidgetSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-28"></div>
        <div className="w-6 h-6 bg-red-200 rounded-full"></div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Quick Links Widget Skeleton
const QuickLinksWidgetSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-3 border border-gray-200 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Key Metrics Skeleton
const KeyMetricsSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="text-center space-y-3 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded w-24 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Weekly Calendar Skeleton
const WeeklyCalendarSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Progress Tracker Skeleton
const ProgressTrackerSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-200 rounded w-36 mb-6 animate-pulse"></div>
      
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className={`h-full bg-gray-300 rounded-full`} style={{ width: `${Math.random() * 100}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Dashboard Footer Skeleton
const DashboardFooterSkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Info */}
        <div className="space-y-3 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-28"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-32"></div>
            <div className="h-3 bg-gray-100 rounded w-24"></div>
            <div className="h-3 bg-gray-100 rounded w-28"></div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-3 bg-gray-100 rounded w-20"></div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="space-y-3 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-28"></div>
            <div className="h-3 bg-gray-100 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Display names
WelcomeHeaderSkeleton.displayName = 'WelcomeHeaderSkeleton';
StatusCardsSkeleton.displayName = 'StatusCardsSkeleton';
PersonalizedStatsSkeleton.displayName = 'PersonalizedStatsSkeleton';
QuickActionsSkeleton.displayName = 'QuickActionsSkeleton';
PersonalizedProgressSkeleton.displayName = 'PersonalizedProgressSkeleton';
RecentActivitySkeleton.displayName = 'RecentActivitySkeleton';
RoleTipsSkeleton.displayName = 'RoleTipsSkeleton';
RoleSpecificWidgetsSkeleton.displayName = 'RoleSpecificWidgetsSkeleton';
QuickStatsWidgetSkeleton.displayName = 'QuickStatsWidgetSkeleton';
NotificationsWidgetSkeleton.displayName = 'NotificationsWidgetSkeleton';
QuickLinksWidgetSkeleton.displayName = 'QuickLinksWidgetSkeleton';
KeyMetricsSkeleton.displayName = 'KeyMetricsSkeleton';
WeeklyCalendarSkeleton.displayName = 'WeeklyCalendarSkeleton';
ProgressTrackerSkeleton.displayName = 'ProgressTrackerSkeleton';
DashboardFooterSkeleton.displayName = 'DashboardFooterSkeleton';
AdminDashboardSkeleton.displayName = 'AdminDashboardSkeleton';

// Exports
export {
  WelcomeHeaderSkeleton,
  StatusCardsSkeleton,
  PersonalizedStatsSkeleton,
  QuickActionsSkeleton,
  PersonalizedProgressSkeleton,
  RecentActivitySkeleton,
  RoleTipsSkeleton,
  RoleSpecificWidgetsSkeleton,
  QuickStatsWidgetSkeleton,
  NotificationsWidgetSkeleton,
  QuickLinksWidgetSkeleton,
  KeyMetricsSkeleton,
  WeeklyCalendarSkeleton,
  ProgressTrackerSkeleton,
  DashboardFooterSkeleton
};

