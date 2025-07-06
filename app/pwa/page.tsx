// app/pwa/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Создайте динамический импорт для всего содержимого страницы
const PWAPageContent = dynamic(
  () => import('./PWAPageContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[100lvh] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка PWA управления...</p>
        </div>
      </div>
    )
  }
);

export default function PWAPage() {
  return <PWAPageContent />;
}