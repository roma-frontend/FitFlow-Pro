// app/admin/users/components/UsersPageContent.tsx
"use client";

import React from 'react';
import { UsersPageHeader } from './UsersPageHeader';
import { UsersPageTabs } from './UsersPageTabs';
import { CreateUserDialog } from './CreateUserDialog';
import { ErrorBoundary } from './ErrorBoundary';
import { useUsersPage } from '../providers/UsersPageProvider';
import { UsersPageSkeleton } from './UsersPageSkeleton';

export const UsersPageContent = React.memo(() => {
  const { state } = useUsersPage();

  if (state.loading) {
    return <UsersPageSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <UsersPageHeader />
        
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UsersPageTabs />
        </main>
        
        <CreateUserDialog />
      </div>
    </ErrorBoundary>
  );
});

UsersPageContent.displayName = 'UsersPageContent';
