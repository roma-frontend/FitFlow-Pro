// app/payment-success/page.tsx (исправленная версия)
"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShopStore } from '@/stores/shopStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Компонент с логикой, который использует useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { setOrderStep } = useShopStore();
  
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    if (paymentIntentId) {
      // Переходим к подтверждению заказа
      setOrderStep('confirm');
    }
  }, [paymentIntentId, setOrderStep]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Платеж успешен!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Ваш заказ был успешно оплачен и передан в обработку.
          </p>
          
          {paymentIntentId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ID платежа: {paymentIntentId}
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h4 className="font-medium text-blue-900 mb-2">Что дальше:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Заказ передан в обработку</li>
              <li>• Вы получите уведомление о готовности</li>
              <li>• Проверить статус можно в разделе "Мои заказы"</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться в магазин
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/orders">
                Мои заказы
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>💳 Платеж обработан безопасно</p>
              <p>📧 Чек отправлен на email</p>
              <p>🔔 Уведомления о статусе заказа</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент загрузки
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Обработка результата платежа...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Основной компонент страницы
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
