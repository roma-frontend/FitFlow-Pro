// components/providers/AIAgentProvider.tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Динамический импорт AIAgent с отключением SSR
const AIAgent = dynamic(
  () => import('@/components/ai-agent/AIAgent'),
  { 
    ssr: false,
    loading: () => null
  }
);

export default function AIAgentProvider({ children }: { children: React.ReactNode }) {
  // Используем флаг для отслеживания монтирования на клиенте
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {children}
      {/* Рендерим AIAgent только после монтирования на клиенте */}
      {isMounted && <AIAgent />}
    </>
  );
}