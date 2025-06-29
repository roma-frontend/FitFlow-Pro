// components/QRScanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Square, X } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);
  const [jsQR, setJsQR] = useState<any>(null);

  // Динамическая загрузка jsQR
  useEffect(() => {
    const loadJsQR = async () => {
      try {
        const jsQRModule = await import('jsqr');
        setJsQR(jsQRModule.default);
      } catch (error) {
        console.error('Ошибка загрузки jsQR:', error);
        onError?.('Не удалось загрузить библиотеку сканирования');
      }
    };

    loadJsQR();
  }, [onError]);

  const startScanning = async () => {
    if (!jsQR) {
      onError?.('Библиотека сканирования не загружена');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Задняя камера для мобильных
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);

        // Запускаем сканирование каждые 100мс для лучшей отзывчивости
        const interval = setInterval(() => {
          scanQRCode();
        }, 100);
        setScanInterval(interval);
      }
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
      onError?.("Не удалось получить доступ к камере. Проверьте разрешения.");
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
    
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !jsQR) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          console.log('QR код найден:', code.data);
          onScan(code.data);
          stopScanning();
        }
      } catch (error) {
        console.error('Ошибка сканирования QR-кода:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="text-center">
          <Button onClick={startScanning} disabled={!jsQR}>
            <Camera className="h-4 w-4 mr-2" />
            {jsQR ? 'Включить сканер QR-кода' : 'Загрузка...'}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Убедитесь, что разрешили доступ к камере
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative mx-auto w-fit">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="rounded-lg border-2 border-gray-300 bg-black"
              style={{ maxWidth: "400px", width: "100%", aspectRatio: "4/3" }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay для прицеливания */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <Square
                  className="h-32 w-32 text-white opacity-70"
                  strokeWidth={2}
                />
                {/* Углы для лучшего прицеливания */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>
              </div>
            </div>

            {/* Кнопка закрытия */}
            <Button
              onClick={stopScanning}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Наведите камеру на QR-код
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Сканирование происходит автоматически
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
