"use client";

import React from 'react';
import { useShopStore } from '@/stores/shopStore';
import OrderConfirmation from '@/components/OrderConfirmation';
import { ArrowLeft, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ShopView from '@/components/shop/ShopView';
import PaymentView from '@/components/shop/Payment/PaymentView';
import MainHeader from '@/components/MainHeader';
import { ShopWithAI } from '@/components/shop/ShopWithAI';

export default function ShopPage() {
  const { orderStep, setOrderStep } = useShopStore();

  const handleBackToShop = () => {
    setOrderStep('shop');
  };

  const getStepTitle = () => {
    switch (orderStep) {
      case 'shop':
        return 'Магазин';
      case 'payment':
        return 'Оплата заказа';
      case 'confirm':
        return 'Заказ завершен';
      default:
        return 'Магазин';
    }
  };

  const getStepDescription = () => {
    switch (orderStep) {
      case 'shop':
        return 'Выберите товары для покупки';
      case 'payment':
        return 'Подтвердите заказ и произведите оплату';
      case 'confirm':
        return 'Ваш заказ успешно оформлен';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-gray-50 to-gray-100">
      <MainHeader
      />

<ShopWithAI />;

      {/* Дополнительная навигация для шагов (только если не на главном шаге магазина) */}
      {orderStep !== 'shop' && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Кнопка возврата в магазин */}
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToShop}
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Вернуться в магазин</span>
                  <span className="sm:hidden">Назад</span>
                </Button>
                
                {/* Заголовок с индикатором шага */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    <h1 className="text-xl font-semibold text-gray-900">
                      {getStepTitle()}
                    </h1>
                  </div>
                  
                  <Badge variant="product" className="hidden sm:inline-flex">
                    {orderStep === 'payment' ? 'Шаг 2 из 3' : 'Завершено'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Описание шага */}
            {getStepDescription() && (
              <p className="text-sm text-gray-600 mt-2 ml-9">
                {getStepDescription()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Индикатор прогресса (показываем только если не на главном шаге магазина) */}
      {orderStep !== 'shop' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-8 max-w-md w-full">
                {/* Шаг 1 - Корзина */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">1</span>
                  </div>
                  <span className="text-sm font-medium text-green-600 hidden sm:inline">
                    Корзина
                  </span>
                </div>

                <div className="h-px bg-green-500 flex-1"></div>

                {/* Шаг 2 - Оплата */}
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    orderStep === 'payment' || orderStep === 'confirm' 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}>
                    <span className="text-white text-sm font-medium">2</span>
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    orderStep === 'payment' || orderStep === 'confirm'
                      ? 'text-green-600' 
                      : 'text-gray-500'
                  }`}>
                    Оплата
                  </span>
                </div>

                <div className={`h-px flex-1 ${
                  orderStep === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>

                {/* Шаг 3 - Подтверждение */}
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    orderStep === 'confirm' ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <span className="text-white text-sm font-medium">3</span>
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    orderStep === 'confirm' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    Готово
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="py-6">
        {orderStep === 'shop' && <ShopView />}
        {orderStep === 'payment' && <PaymentView />}
        {orderStep === 'confirm' && <OrderConfirmation />}
      </div>
    </div>
  );
}
