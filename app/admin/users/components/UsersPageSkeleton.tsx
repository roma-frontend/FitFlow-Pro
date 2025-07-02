// app/admin/users/components/UsersPageSkeleton.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const UsersPageSkeleton = React.memo(() => {
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Skeleton */}
      <HeaderSkeleton />
      
      <main className="relative px-4 md:px-6 lg:px-8 py-8">
        {/* Tabs Skeleton */}
        <TabsSkeleton />
        
        {/* Content Skeleton */}
        <div className="mt-6">
          <UserCardsSkeleton />
        </div>
      </main>
    </div>
  );
});

// Header Skeleton Component
const HeaderSkeleton = React.memo(() => {
  return (
    <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm rounded-xl">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="hidden md:flex items-center justify-between">
          {/* Left side - Title and description */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-blue-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
});

// Tabs Skeleton Component
const TabsSkeleton = React.memo(() => {
  return (
    <div className="hidden md:block space-y-6">
      {/* Tabs Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          {/* Tab buttons */}
          <div className="flex space-x-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div 
                key={index} 
                className={`h-10 rounded-lg animate-pulse ${
                  index === 0 ? 'w-24 bg-blue-200' : 'w-20 bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
          
          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Filters Row */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex flex-wrap gap-3">
            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Results info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// User Cards Grid Skeleton
const UserCardsSkeleton = React.memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <UserCardSkeleton key={index} delay={index * 100} />
      ))}
    </div>
  );
});

// Individual User Card Skeleton
const UserCardSkeleton = React.memo(({ delay = 0 }: { delay?: number }) => {
  return (
    <Card 
      className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          {/* Avatar Skeleton */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
            {/* Status indicator skeleton */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-200 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          
          {/* Role Badge Skeleton */}
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        
        {/* Name Skeleton */}
        <div className="space-y-2 mt-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-100 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="text-center">
            <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Last Activity Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
});

// Display names
HeaderSkeleton.displayName = 'HeaderSkeleton';
TabsSkeleton.displayName = 'TabsSkeleton';
UserCardsSkeleton.displayName = 'UserCardsSkeleton';
UserCardSkeleton.displayName = 'UserCardSkeleton';
UsersPageSkeleton.displayName = 'UsersPageSkeleton';

// Exports
export { HeaderSkeleton, TabsSkeleton, UserCardsSkeleton, UserCardSkeleton };
