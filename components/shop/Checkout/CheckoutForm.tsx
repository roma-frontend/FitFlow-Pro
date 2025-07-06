"use client";

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  paymentIntentId: string;
  orderId?: string; // Добавляем отдельный orderId
  onSuccess: (receipt: any) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({
  paymentIntentId,
  orderId,
  onSuccess,
  onError
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe не загружен');
      return;
    }

    setLoading(true);

    try {
      console.log('💳 CheckoutForm: начинаем подтверждение платежа...');

      // ✅ Проверяем готовность элементов
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || 'Ошибка при отправке формы');
      }

      // ✅ Подтверждаем Payment Intent
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/shop/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Более детальная обработка ошибок
        console.error('❌ Stripe error:', error);
        throw new Error(error.message || 'Ошибка при подтверждении платежа');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ CheckoutForm: платеж успешен:', paymentIntent.id);

        toast({
          title: "Платеж успешен!",
          description: "Обрабатываем ваш заказ...",
        });

        // ✅ Подтверждаем заказ через API с правильными параметрами
        const confirmResponse = await fetch('/api/payments/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderId: orderId || paymentIntentId, // Используем orderId или fallback
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || 'Ошибка подтверждения заказа');
        }

        const confirmData = await confirmResponse.json();
        console.log('✅ CheckoutForm: заказ подтвержден с данными:', confirmData);

        toast({
          title: "Заказ оформлен!",
          description: "Переходим к подтверждению...",
        });

        // ✅ Передаем чек с полными данными
        onSuccess(confirmData.receipt || confirmData);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        toast({
          title: "Платеж обрабатывается",
          description: "Ожидайте подтверждения...",
        });
      } else {
        throw new Error(`Неожиданный статус платежа: ${paymentIntent?.status || 'неизвестен'}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('❌ CheckoutForm: ошибка:', errorMessage, err);
      
      toast({
        title: "Ошибка платежа",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <PaymentElement 
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
            paymentMethodOrder: ['card'],
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
              },
            },
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Обработка платежа...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Оплатить заказ
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Нажимая "Оплатить заказ", вы соглашаетесь с условиями обслуживания
      </p>
    </form>
  );
}