// components/face-auth/LazyComponents.tsx
"use client";

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { DebugPanelProps } from '@/types/face-auth.types';

// Lazy load тяжелых компонентов с правильными типами
export const LazyDebugInfo = dynamic(() => import('./DebugInfo'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />,
  ssr: false
}) as ComponentType<DebugPanelProps>;

export const LazyDetectionPanel = dynamic(() => import('./DetectionPanel'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />,
  ssr: false
});

export const LazyVideoCamera = dynamic(() => import('./VideoCamera'), {
  loading: () => (
    <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-gray-500">Загрузка камеры...</div>
    </div>
  ),
  ssr: false
});

// HOC для условного рендеринга с типизацией
export const withConditionalRender = <P extends object>(
  Component: ComponentType<P>,
  condition: (props?: P) => boolean
) => {
  const ConditionalComponent = (props: P) => {
    if (!condition(props)) {
      return null;
    }
    return <Component {...props} />;
  };
  
  ConditionalComponent.displayName = `ConditionalRender(${Component.displayName || Component.name})`;
  
  return ConditionalComponent;
};
