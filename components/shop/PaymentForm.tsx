// components/PaymentForm.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, User, Mail } from 'lucide-react';
import { ShopPaymentItem } from '@/types/payment';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CheckoutForm from './Checkout/CheckoutForm';

interface PaymentFormProps {
  items: ShopPaymentItem[];
  totalAmount: number;
  pickupType: string;
  notes?: string;
  onSuccess: (receipt: any) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({
  items,
  totalAmount,
  pickupType,
  notes,
  onSuccess,
  onError
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // ✅ Упрощенное состояние для Stripe
  const [stripeReady, setStripeReady] = useState<boolean | null>(null);
  
  // Состояние для данных пользователя
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // ✅ ИСПРАВЛЕННАЯ проверка готовности Stripe
  useEffect(() => {
    let isMounted = true; // ✅ Предотвращаем race conditions
    
    const checkStripeReady = async () => {
      try {
        console.log('🔄 Загружаем Stripe...');
        
        // ✅ Проверяем переменную окружения сначала
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY не настроен в .env.local');
        }
        
        const stripe = await stripePromise;
        
        if (!isMounted) return; // ✅ Компонент размонтирован
        
        if (stripe) {
          console.log('✅ Stripe успешно загружен');
          setStripeReady(true);
        } else {
          throw new Error('Stripe не удалось инициализировать');
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка Stripe';
        console.error('❌ Ошибка Stripe:', errorMsg);
        setStripeReady(false);
        setError(errorMsg);
      }
    };

    checkStripeReady();
    
    // ✅ Cleanup функция
    return () => {
      isMounted = false;
    };
  }, []); // ✅ Пустой массив зависимостей

  // ✅ ИСПРАВЛЕННАЯ инициализация данных пользователя
  useEffect(() => {
    if (authLoading || stripeReady !== true) return; // ✅ Ждем загрузки обоих
    
    console.log('👤 Инициализируем данные пользователя:', { user, stripeReady });
    
    if (user?.email && user?.name) {
      // ✅ Пользователь авторизован с полными данными
      setCustomerData({
        email: user.email,
        name: user.name,
        phone: ''
      });
      setShowCustomerForm(false);
      setDataReady(true);
    } else if (user?.email || user?.name) {
      // ✅ Пользователь авторизован, но данные неполные
      setCustomerData({
        email: user.email || '',
        name: user.name || '',
        phone: ''
      });
      setShowCustomerForm(true);
      setDataReady(false);
    } else {
      // ✅ Пользователь не авторизован
      setCustomerData({
        email: '',
        name: '',
        phone: ''
      });
      setShowCustomerForm(true);
      setDataReady(false);
    }
  }, [user, authLoading, stripeReady]);

  // ✅ ИСПРАВЛЕННОЕ создание PaymentIntent с debounce
  useEffect(() => {
    if (!stripeReady || !dataReady || clientSecret || loading) {
      return;
    }

    // ✅ Debounce для предотвращения множественных вызовов
    const timeoutId = setTimeout(() => {
      createPaymentIntent();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [stripeReady, dataReady, clientSecret, loading]);

  const createPaymentIntent = async () => {
    const finalEmail = user?.email || customerData.email;
    const finalName = user?.name || customerData.name;
    const finalPhone = customerData.phone;
    
    if (!finalEmail || !finalName) {
      const errorMsg = `Недостаточно данных: email="${finalEmail}", name="${finalName}"`;
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('💳 Создаем PaymentIntent с данными:', {
        finalEmail,
        finalName,
        finalPhone,
        totalAmount,
        itemsCount: items.length
      });

      toast({
        title: "Подготовка к оплате",
        description: "Инициализируем платежную систему...",
      });

      const requestData = {
        items,
        totalAmount,
        pickupType,
        notes: notes || '',
        userId: user?.id || 'guest',
        memberId: user?.id || undefined,
        memberEmail: finalEmail,
        customerName: finalName,
        customerPhone: finalPhone || undefined,
      };

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);

      toast({
        title: "Готово к оплате",
        description: "Платежная форма готова к использованию",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания платежа';
      console.error('❌ Ошибка создания PaymentIntent:', errorMessage);
      setError(errorMessage);
      onError(errorMessage);
      
      toast({
        title: "Ошибка инициализации",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerDataSubmit = () => {
    if (!customerData.email || !customerData.name) {
      toast({
        title: "Заполните данные",
        description: "Email и имя обязательны для оформления заказа",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Данные клиента подтверждены:', customerData);
    setDataReady(true);
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
    locale: 'ru' as const,
  };

  // ✅ Ошибка Stripe или отсутствие ключей
  if (stripeReady === false || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ошибка платежной системы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 mb-4">
            {error || 'Не удалось загрузить Stripe'}
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 p-3 rounded text-sm mb-4">
              <p><strong>Проверьте:</strong></p>
              <ul className="list-disc ml-4 mt-2">
                <li>Переменная NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY в .env.local</li>
                <li>Ключ начинается с pk_test_ или pk_live_</li>
                <li>Интернет-соединение работает</li>
                <li>CSP разрешает https://js.stripe.com</li>
              </ul>
              
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <strong>Текущий ключ:</strong> {
                  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
                    ? `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.slice(0, 12)}...`
                    : 'НЕ УСТАНОВЛЕН'
                }
              </div>
            </div>
          )}
          
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Перезагрузить страницу
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ✅ Загрузка Stripe
  if (stripeReady === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Загрузка платежной системы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Подключаемся к Stripe...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Проверка авторизации
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Проверка авторизации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Проверяем данные пользователя...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Форма данных клиента
  if (showCustomerForm && !dataReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Данные для заказа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Для оформления заказа укажите ваши контактные данные:
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="name">Имя *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={customerData.name}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Телефон (необязательно)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleCustomerDataSubmit}
            disabled={loading || !customerData.email.trim() || !customerData.name.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Подготовка платежа...
              </>
            ) : (
              'Продолжить к оплате'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ✅ Подготовка к оплате
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Подготовка к оплате</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Инициализация платежной формы...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Ожидание PaymentIntent
  if (!clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Подготовка платежа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Создаем платежный интент...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Финальная форма оплаты
  return (
    <Card>
      <CardHeader>
        <CardTitle>Оплата заказа</CardTitle>
        <div className="text-sm text-gray-600">
          <p>👤 {user?.name || customerData.name}</p>
          <p>📧 {user?.email || customerData.email}</p>
          {customerData.phone && (
            <p>📞 {customerData.phone}</p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            paymentIntentId={paymentIntentId}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
