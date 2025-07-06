// app/payment-success/trainer/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Calendar, Clock, Loader2, Printer, Mail } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentIntentId) {
      // Здесь можно получить детали платежа с сервера
      // Для примера используем моковые данные
      setTimeout(() => {
        setReceipt({
          receiptId: `TRAIN-${Date.now()}`,
          amount: 2200,
          currency: 'RUB',
          paidAt: new Date().toISOString(),
          booking: {
            trainerName: 'Елена Смирнова',
            date: new Date().toISOString().split('T')[0],
            time: '19:00',
            type: 'personal',
          },
          customer: {
            name: 'Иван Иванов',
            email: 'ivan@example.com',
          }
        });
        setLoading(false);
      }, 1000);
    }
  }, [paymentIntentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[100lvh] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Загрузка информации о платеже...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Оплата прошла успешно!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {receipt && (
            <>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-3">Детали бронирования</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Номер квитанции:</p>
                    <p className="font-medium">{receipt.receiptId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Дата оплаты:</p>
                    <p className="font-medium">
                      {new Date(receipt.paidAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Сумма:</p>
                    <p className="font-medium text-lg">{receipt.amount} ₽</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Статус:</p>
                    <p className="font-medium text-green-600">Оплачено</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Информация о тренировке</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Тренер:</span>
                      <span className="font-medium">{receipt.booking.trainerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(receipt.booking.date).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{receipt.booking.time}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Клиент</h4>
                  <div className="space-y-1 text-sm">
                    <p>{receipt.customer.name}</p>
                    <p className="text-gray-600">{receipt.customer.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Важная информация</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Квитанция отправлена на {receipt.customer.email}</li>
                  <li>• Приходите за 10 минут до начала тренировки</li>
                  <li>• Возьмите с собой спортивную форму и полотенце</li>
                  <li>• Для отмены или переноса свяжитесь с нами за 24 часа</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handlePrint} variant="outline" className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Распечатать квитанцию
                </Button>
                
                <Button asChild className="flex-1">
                  <Link href="/member-login">
                    <Calendar className="w-4 h-4 mr-2" />
                    Мои тренировки
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <Button variant="link" asChild>
                  <Link href="/trainers" className="text-sm">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Записаться на другую тренировку
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Версия для печати */}
      <div className="hidden print:block">
        <div className="p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Квитанция об оплате</h1>
          {receipt && (
            <div className="space-y-4">
              <p><strong>Номер:</strong> {receipt.receiptId}</p>
              <p><strong>Дата:</strong> {new Date(receipt.paidAt).toLocaleDateString('ru-RU')}</p>
              <p><strong>Сумма:</strong> {receipt.amount} ₽</p>
              <p><strong>Тренер:</strong> {receipt.booking.trainerName}</p>
              <p><strong>Дата тренировки:</strong> {new Date(receipt.booking.date).toLocaleDateString('ru-RU')}</p>
              <p><strong>Время:</strong> {receipt.booking.time}</p>
              <p><strong>Клиент:</strong> {receipt.customer.name}</p>
              <p><strong>Email:</strong> {receipt.customer.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100lvh] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Загрузка...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}