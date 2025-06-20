// app/dashboard/page.tsx
"use client";

import React from 'react';
import { UnifiedDataProvider } from '@/contexts/UnifiedDataContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import SystemDashboard, { SystemTestPanel } from '@/components/SystemDashboard';

export default function DashboardPage() {
  // В реальном приложении эти данные будут получены из аутентификации
  const userRole = 'admin' as const;
  const userId = 'admin_1';

  return (
    <UnifiedDataProvider>
      <MessagingProvider>
        <div className="min-h-screen bg-gray-50">
          <SystemDashboard userRole={userRole} userId={userId} />
          <SystemTestPanel />
        </div>
      </MessagingProvider>
    </UnifiedDataProvider>
  );
}
