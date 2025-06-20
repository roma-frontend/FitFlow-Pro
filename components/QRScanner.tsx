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
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
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
    setIsScanning(false);
  };

  // Симуляция сканирования для демо
  const simulateQRScan = () => {
    const mockQRData = `qr_login_token_${Date.now()}`;
    onScan(mockQRData);
    stopScanning();
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
          <Button onClick={startScanning}>
            <Camera className="h-4 w-4 mr-2" />
            Включить сканер QR-кода
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
              style={{ maxWidth: "300px", width: "100%", aspectRatio: "4/3" }}
            />

            {/* Overlay для прицеливания */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <Square
                  className="h-24 w-24 text-white opacity-70"
                  strokeWidth={2}
                />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
              </div>
            </div>

            <Button
              onClick={stopScanning}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Наведите камеру на QR-код
            </p>
            {/* Кнопка для демо */}
            <Button 
              onClick={simulateQRScan}
              variant="outline"
              size="sm"
            >
              Симулировать сканирование (ДЕМО)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
