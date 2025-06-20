// Receipt.tsx (обновленный)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatProductPrice } from '@/hooks/useShopProducts';

interface ReceiptProps {
  receipt: {
    receiptId?: string;
    orderId?: string;
    paymentId?: string;
    amount?: number;
    currency?: string;
    paidAt?: string;
    customer?: {
      email?: string;
      name?: string;
    };
    items?: Array<{
      name?: string;
      quantity?: number;
      price?: number;
      total?: number;
    }>;
    company?: {
      name?: string;
      address?: string;
      inn?: string;
      phone?: string;
    };
  };
}

export default function Receipt({ receipt }: ReceiptProps) {
  if (!receipt) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <p>Чек не найден</p>
        </CardContent>
      </Card>
    );
  }

  const company = receipt.company || {};
  const customer = receipt.customer || {};
  const items = receipt.items || [];

  const companyName = company.name || 'FitAccess';
  const companyAddress = company.address || 'г. Москва, ул. Примерная, д. 1';
  const companyInn = company.inn || '1234567890';
  const companyPhone = company.phone || '+7 (495) 123-45-67';

  const customerName = customer.name || 'Покупатель';
  const customerEmail = customer.email || 'customer@fitaccess.ru';

  const receiptId = receipt.receiptId || 'Неизвестен';
  const orderId = receipt.orderId || 'Неизвестен';
  const paymentId = receipt.paymentId || 'Неизвестен';
  const amount = receipt.amount || 0;
  const paidAt = receipt.paidAt || new Date().toISOString();

  return (
    <Card className="max-w-md mx-auto print-receipt">
      <CardHeader className="text-center">
        <CardTitle>{companyName}</CardTitle>
        <p className="text-sm text-gray-600">{companyAddress}</p>
        <p className="text-sm text-gray-600">ИНН: {companyInn}</p>
        <p className="text-sm text-gray-600">{companyPhone}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Чек #{receiptId}</h3>
          <p className="text-sm text-gray-600">Заказ: {orderId}</p>
          <p className="text-sm text-gray-600">
            Дата: {new Date(paidAt).toLocaleString('ru-RU')}
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Покупатель:</h4>
          <p className="text-sm">{customerName}</p>
          <p className="text-sm text-gray-600">{customerEmail}</p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Товары:</h4>
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item, index) => {
                const itemName = item?.name || `Товар ${index + 1}`;
                const itemQuantity = item?.quantity || 1;
                const itemPrice = item?.price || 0;
                const itemTotal = item?.total || 0;

                return (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{itemName}</p>
                      <p className="text-gray-600">
                        {itemQuantity} × {formatProductPrice(itemPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      {formatProductPrice(itemTotal)}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">Товары не найдены</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Итого:</span>
            <span>{formatProductPrice(amount)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Оплачено картой
          </p>
        </div>

        <div className="border-t pt-4 text-center text-xs text-gray-500">
          <p>ID платежа: {paymentId}</p>
          <p className="mt-2">Спасибо за покупку!</p>
        </div>
      </CardContent>
    </Card>
  );
}
