// components/providers/AIAgentProvider.tsx
"use client";

import { Suspense } from 'react';
import AIAgent from '@/components/ai-agent/AIAgent';

export default function AIAgentProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <AIAgent />
      </Suspense>
    </>
  );
}