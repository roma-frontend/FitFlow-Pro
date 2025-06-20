// contexts/AppProvider.tsx
"use client";

import React, { ReactNode } from 'react';
import { AdminProvider } from './AdminContext';
import { ManagerProvider } from './ManagerContext';
import { ScheduleProvider } from './ScheduleContext';
import { SuperAdminProvider } from './SuperAdminContext';
import { TrainerProvider } from './TrainerContext';
import { DashboardProvider } from './DashboardContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <DashboardProvider>
      <ScheduleProvider>
        <SuperAdminProvider>
          <AdminProvider>
            <ManagerProvider>
              <TrainerProvider>
                {children}
              </TrainerProvider>
            </ManagerProvider>
          </AdminProvider>
        </SuperAdminProvider>
      </ScheduleProvider>
    </DashboardProvider>
  );
};
