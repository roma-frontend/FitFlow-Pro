// components/face-auth/PerformanceMonitor.tsx - ОБНОВЛЕННАЯ версия
"use client";

import React, { useEffect, useState, memo } from 'react';
import { useFaceAuthContext } from './FaceAuthProvider';

const PerformanceMonitor = memo(() => {
  const { state } = useFaceAuthContext();
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    if (!state.showDebugInfo) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024));
      }
    };

    measureFPS();
    const memoryInterval = setInterval(measureMemory, 2000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, [state.showDebugInfo]);

  if (!state.showDebugInfo) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono z-50 min-w-[120px]">
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={fps > 30 ? 'text-green-400' : fps > 15 ? 'text-yellow-400' : 'text-red-400'}>
            {fps}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={memoryUsage < 100 ? 'text-green-400' : memoryUsage < 200 ? 'text-yellow-400' : 'text-red-400'}>
            {memoryUsage}MB
          </span>
        </div>
        <div className="flex justify-between">
          <span>Camera:</span>
          <span className={state.cameraActive ? 'text-green-400' : 'text-red-400'}>
            {state.cameraActive ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Scan:</span>
          <span className={state.isScanning ? 'text-blue-400' : 'text-gray-400'}>
            {state.isScanning ? 'ACTIVE' : 'IDLE'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Face:</span>
          <span className={state.faceDetection.detected ? 'text-green-400' : 'text-gray-400'}>
            {state.faceDetection.detected ? 'DETECTED' : 'NONE'}
          </span>
        </div>
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
