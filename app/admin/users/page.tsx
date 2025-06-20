// app/admin/users/page.tsx
"use client";

import { Suspense } from 'react';
import { UsersPageProvider } from './providers/UsersPageProvider';
import { UsersPageSkeleton } from './components/UsersPageSkeleton';
import { UsersPageContent } from './components/UserPageContent';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function UsersManagementPage() {
  return (
    <ErrorBoundary fallback={<div>Что-то пошло не так</div>}>
      <UsersPageProvider>
        <Suspense fallback={<UsersPageSkeleton />}>
          <UsersPageContent />
        </Suspense>
      </UsersPageProvider>
    </ErrorBoundary>
  );
}
