import React from 'react';
import { useShopStore } from '@/stores/shopStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, Settings } from 'lucide-react';
import Receipt from './Receipt';

export default function OrderConfirmation() {
  const { receipt, setOrderStep, resetOrder } = useShopStore();
  const [showDebug, setShowDebug] = React.useState(false);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleBackToShop = () => {
    resetOrder();
  };

  if (!receipt) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="text-center py-8">
            <p>Информация о заказе не найдена</p>
            <Button onClick={handleBackToShop} className="mt-4">
              Вернуться в магазин
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Получаем данные с проверкой качества
  const customerEmail = receipt.customer?.email;
  const customerName = receipt.customer?.name;
  const customerPhone = receipt.customer?.phone;
  const orderId = receipt.orderId || receipt.receiptId || 'неизвестен';
  const dataQuality = receipt.dataQuality || {};
  
  console.log('📧 OrderConfirmation: полученные данные:', {
    email: customerEmail,
    name: customerName,
    phone: customerPhone,
    dataQuality: dataQuality,
    receipt: receipt
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Индикатор прогресса */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Заказ завершен
            {/* ✅ Кнопка отладки (только в development) */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            {/* Шаг 1 - Корзина */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Корзина</span>
            </div>

            <div className="h-px bg-green-500 flex-1"></div>

            {/* Шаг 2 - Оплата */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Оплата</span>
            </div>

            <div className="h-px bg-green-500 flex-1"></div>

            {/* Шаг 3 - Подтверждение */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Завершено</span>
            </div>
          </div>
        </CardContent>
      </Card>


      <div className="space-y-6">
        {/* Сообщение об успехе */}
        <Card>
          <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Заказ успешно оформлен!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Ваш заказ #{orderId} был успешно оплачен и передан в обработку.
            </p>
            
            {/* ✅ Показываем информацию о клиенте если данные реальные */}
            {dataQuality.isRealData && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Данные заказчика</h4>
                <div className="space-y-1 text-sm text-blue-600">
                  <p>👤 {customerName}</p>
                  <p>📧 {customerEmail}</p>
                  {customerPhone && <p>📞 {customerPhone}</p>}
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  Уведомление о готовности заказа будет отправлено на указанный email.
                </p>
              </div>
            )}
            
            {/* ✅ Предупреждение если данные моковые */}
            {!dataQuality.isRealData && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Внимание</h4>
                <p className="text-sm text-yellow-600">
                  Заказ оформлен с базовыми данными. Для получения уведомлений о готовности заказа, 
                  пожалуйста, авторизуйтесь в системе или укажите ваши контактные данные при следующем заказе.
                </p>
                <div className="mt-2 p-2 bg-white rounded border text-xs">
                  <p><strong>Использованы данные:</strong></p>
                  <p>Email: {customerEmail}</p>
                  <p>Имя: {customerName}</p>
                </div>
              </div>
            )}
            
            {/* Информация о получении */}
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-blue-800 mb-2">Информация о получении</h4>
              <p className="text-sm text-blue-600">📍 Самовывоз из фитнес-центра FitAccess</p>
              <p className="text-sm text-blue-600">⏰ Готовность заказа: в течение 30 минут</p>
              <p className="text-sm text-blue-600">📞 Телефон: +7 (495) 123-45-67</p>
            </div>
          </CardContent>
        </Card>

        {/* Чек */}
        <div className="print:block">
          <Receipt receipt={receipt} />
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-4 justify-center print:hidden">
          <Button onClick={handlePrintReceipt} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Скачать чек
          </Button>
          <Button onClick={handleBackToShop}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в магазин
          </Button>
        </div>
      </div>
    </div>
  );
}

              
