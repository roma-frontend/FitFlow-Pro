// app/payment-cancel/page.tsx
"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Компонент с логикой, который использует useSearchParams
function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'cancelled';

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'cancelled':
        return 'Платеж был отменен';
      case 'failed':
        return 'Платеж не прошел';
      case 'declined':
        return 'Платеж отклонен банком';
      default:
        return 'Платеж не завершен';
    }
  };

  const getReasonDescription = (reason: string) => {
    switch (reason) {
      case 'cancelled':
        return 'Вы отменили процесс оплаты. Ваши товары сохранены в корзине.';
      case 'failed':
        return 'Произошла ошибка при обработке платежа. Попробуйте еще раз.';
      case 'declined':
        return 'Банк отклонил транзакцию. Проверьте данные карты или обратитесь в банк.';
      default:
        return 'Платеж не был завершен. Попробуйте еще раз или выберите другой способ оплаты.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            {getReasonText(reason)}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {getReasonDescription(reason)}
          </p>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h4 className="font-medium text-yellow-900 mb-2">Что можно сделать:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Проверить данные карты</li>
              <li>• Попробовать другую карту</li>
              <li>• Обратиться в службу поддержки</li>
              <li>• Повторить попытку позже</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/shop/cart">
                <RefreshCw className="w-4 h-4 mr-2" />
                Повторить оплату
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться в магазин
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>🔒 Ваши данные защищены</p>
              <p>💳 Средства не списаны</p>
              <p>🛒 Товары сохранены в корзине</p>
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Обработка результата платежа...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Основной компонент страницы
export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCancelContent />
    </Suspense>
  );
}
