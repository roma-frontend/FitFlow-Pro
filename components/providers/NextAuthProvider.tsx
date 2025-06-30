// components/providers/NextAuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface NextAuthProviderProps {
  children: ReactNode;
}

export function NextAuthProvider({ children }: NextAuthProviderProps) {
  return (
    <SessionProvider refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}