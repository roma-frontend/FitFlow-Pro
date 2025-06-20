import React, { memo } from 'react';
import { Button } from '@/components/ui/button';

interface ReceiptSectionProps {
  receipt: any;
  onShowReceipt: () => void;
}

const ReceiptSection = memo(({ receipt, onShowReceipt }: ReceiptSectionProps) => {
  if (!receipt) return null;

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        onClick={onShowReceipt}
        className="mb-4"
      >
        Посмотреть чек
      </Button>

      <div className="bg-gray-50 rounded-lg p-4 text-left">
        <h4 className="font-medium mb-2">Детали оплаты:</h4>
        <div className="text-sm space-y-1">
          <p>
            Сумма: <strong>{receipt.amount} {receipt.currency || "₽"}</strong>
          </p>
          <p>
            Способ оплаты: <strong>{receipt.paymentMethod || "Банковская карта"}</strong>
          </p>
          <p>
            Дата: <strong>{new Date(receipt.paidAt).toLocaleString()}</strong>
          </p>
          {receipt.transactionId && (
            <p>
              ID транзакции: <strong>{receipt.transactionId}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

ReceiptSection.displayName = 'ReceiptSection';

export default ReceiptSection;
