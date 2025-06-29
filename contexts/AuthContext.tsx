// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { AuthUser, AuthSession, LoginResult } from '@/lib/unified-auth';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (email: string, password: string) => Promise<LoginResult>;
  loginWithQR: (qrCode: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useUnifiedAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
