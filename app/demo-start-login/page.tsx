// app/demo-start-login/page.tsx
"use client";

import { useState } from "react";
import QRScanner from "@/components/QRCodeScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, Camera } from "lucide-react";

export default function DemoStartLoginPage() {
  const [scannedData, setScannedData] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (data: string) => {
    console.log('Отсканированные данные:', data);
    setScannedData(data);
    setError("");
    setIsProcessing(true);

    try {
      // Здесь можно добавить логику обработки QR-кода
      // Например, проверка формата, отправка на сервер и т.д.
      
      // Имитация обработки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Проверяем формат QR-кода (пример)
      if (data.startsWith('http') || data.includes('login') || data.includes('auth')) {
        console.log('QR-код успешно обработан');
      } else {
        setError('QR-код не содержит данных для входа');
      }
    } catch (err) {
      setError('Ошибка обработки QR-кода');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (errorMessage: string) => {
    console.error('Ошибка сканирования:', errorMessage);
    setError(errorMessage);
  };

  const resetScanner = () => {
    setScannedData("");
    setError("");
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Демо QR Сканер</h1>
          <p className="text-gray-600">
            Сканируйте QR-код для быстрого входа в систему
          </p>
        </div>

        {/* Основная карточка со сканером */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Сканер
            </CardTitle>
            <CardDescription>
              Наведите камеру на QR-код для автоматического сканирования
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QRScanner 
              onScan={handleScan}
              onError={handleError}
            />
          </CardContent>
        </Card>

        {/* Обработка результата */}
        {isProcessing && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Обработка QR-кода...
            </AlertDescription>
          </Alert>
        )}

        {/* Ошибка */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Результат сканирования */}
        {scannedData && !isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Результат сканирования
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Отсканированные данные:
                </p>
                <p className="break-all text-sm font-mono bg-white p-2 rounded border">
                  {scannedData}
                </p>
              </div>

              {/* Анализ данных */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Анализ:</p>
                <div className="text-sm text-gray-600">
                  {scannedData.startsWith('http') && (
                    <p>✅ Обнаружена ссылка</p>
                  )}
                  {scannedData.includes('login') && (
                    <p>✅ Содержит данные для входа</p>
                  )}
                  {scannedData.includes('auth') && (
                    <p>✅ Содержит данные авторизации</p>
                  )}
                  {!scannedData.startsWith('http') && !scannedData.includes('login') && !scannedData.includes('auth') && (
                    <p>ℹ️ Обычный текст или данные</p>
                  )}
                </div>
              </div>

              <Button onClick={resetScanner} variant="outline" className="w-full">
                Сканировать еще раз
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Инструкции */}
        <Card>
          <CardHeader>
            <CardTitle>Инструкции</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>1. Нажмите "Включить сканер QR-кода"</p>
            <p>2. Разрешите доступ к камере в браузере</p>
            <p>3. Наведите камеру на QR-код</p>
            <p>4. Дождитесь автоматического сканирования</p>
            <p className="text-xs text-gray-500 mt-4">
              💡 Для лучшего результата используйте хорошее освещение и держите камеру устойчиво
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
