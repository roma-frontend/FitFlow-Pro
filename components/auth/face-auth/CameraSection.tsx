// components/face-auth/VideoCamera.tsx - ИСПРАВЛЕННАЯ версия
"use client";

import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useFaceAuthContext } from './FaceAuthProvider';

interface VideoCameraProps {
  viewMode: "desktop" | "mobile" | "modern";
  videoRef?: React.RefObject<HTMLVideoElement | null>; // 🔥 ДОБАВЛЕНО
  canvasRef?: React.RefObject<HTMLCanvasElement | null>; // 🔥 ДОБАВЛЕНО
}

const VideoCamera = memo(({ 
  viewMode, 
  videoRef: externalVideoRef, 
  canvasRef: externalCanvasRef 
}: VideoCameraProps) => {
  const { state, dispatch } = useFaceAuthContext();
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const internalDetectionRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Используем внешние рефы если переданы, иначе внутренние
  const videoRef = externalVideoRef || internalVideoRef;
  const detectionRef = externalCanvasRef || internalDetectionRef;

  const getVideoConstraints = useCallback(() => {
    switch (viewMode) {
      case "mobile":
        return { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' };
      case "desktop":
        return { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' };
      default:
        return { width: 640, height: 480 };
    }
  }, [viewMode]);

  const renderDetection = useCallback(() => {
    if (viewMode !== "modern") return;
    
    const canvas = detectionRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) {
      if (state.isScanning) {
        animationRef.current = requestAnimationFrame(renderDetection);
      }
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state.faceDetection.detected && state.faceDetection.boundingBox) {
      const { boundingBox, landmarks, quality } = state.faceDetection;
      
      const avgQuality = (quality.lighting + quality.stability + quality.clarity) / 3;
      const color = avgQuality > 80 ? '#10B981' : avgQuality > 60 ? '#F59E0B' : '#EF4444';
      
      // Рисуем рамку детекции
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.lineDashOffset = -Date.now() / 50;
      
      ctx.strokeRect(
        boundingBox.x * (canvas.width / 640),
        boundingBox.y * (canvas.height / 480),
        boundingBox.width * (canvas.width / 640),
        boundingBox.height * (canvas.height / 480)
      );
      
      // Угловые маркеры
      ctx.setLineDash([]);
      ctx.lineWidth = 4;
      const cornerSize = 20;
      const x = boundingBox.x * (canvas.width / 640);
      const y = boundingBox.y * (canvas.height / 480);
      const w = boundingBox.width * (canvas.width / 640);
      const h = boundingBox.height * (canvas.height / 480);
      
      ctx.beginPath();
      ctx.moveTo(x, y + cornerSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerSize, y);
      ctx.moveTo(x + w - cornerSize, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerSize);
      ctx.moveTo(x + w, y + h - cornerSize);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w - cornerSize, y + h);
      ctx.moveTo(x + cornerSize, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + h - cornerSize);
      ctx.stroke();
      
      // Точки лица
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * (canvas.width / 640);
        const y = landmark.y * (canvas.height / 480);
        
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        const pulse = Math.sin(Date.now() / 200 + index) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(59, 130, 246, ${pulse})`;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Сканирующая линия
    if (state.scanProgress.stage === 'analyzing') {
      const lineY = (canvas.height * state.scanProgress.progress / 100);
      const gradient = ctx.createLinearGradient(0, lineY - 2, 0, lineY + 2);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, lineY - 2, canvas.width, 4);
    }
    
    if (state.isScanning) {
      animationRef.current = requestAnimationFrame(renderDetection);
    }
  }, [viewMode, state.faceDetection, state.scanProgress, state.isScanning]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: getVideoConstraints(),
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
    }
  }, [getVideoConstraints, videoRef]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [videoRef]);

  useEffect(() => {
    if (state.isScanning) {
      startCamera();
      if (viewMode === "modern") {
        renderDetection();
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [state.isScanning, viewMode, startCamera, stopCamera, renderDetection]);

  return (
    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      <canvas
        ref={detectionRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Статические уголки рамки */}
      {!state.isScanning && (
        <>
          <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-blue-400 rounded-tl-lg opacity-50"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-blue-400 rounded-tr-lg opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-blue-400 rounded-bl-lg opacity-50"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-blue-400 rounded-br-lg opacity-50"></div>
        </>
      )}
    </div>
  );
});

VideoCamera.displayName = 'VideoCamera';

export default VideoCamera;
