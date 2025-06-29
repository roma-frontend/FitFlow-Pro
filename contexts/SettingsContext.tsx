// contexts/SettingsContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSettingsManager } from '@/hooks/useSettingsManager';
import type { SystemConfig } from '@/types/settings';

interface SettingsContextType {
  config: SystemConfig | null;
  loading: boolean;
  saving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  updateConfig: (section: keyof SystemConfig, updates: any) => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsManager = useSettingsManager();

  return (
    <SettingsContext.Provider value={settingsManager}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
