import React, { memo } from 'react';

interface NextStepsProps {
  pickupType: string;
}

const NextSteps = memo(({ pickupType }: NextStepsProps) => {
  const getPickupInstructions = (type: string) => {
    switch (type) {
      case 'counter':
        return 'на стойке ресепшн';
      case 'locker':
        return 'в автомате';
      case 'table':
        return 'за вашим столиком';
      default:
        return 'в указанном месте';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="font-medium mb-2">Что дальше?</h3>
      <ul className="text-sm text-gray-600 space-y-1 text-left">
        <li>• Мы начнем готовить ваш заказ</li>
        <li>• Вы получите уведомление когда заказ будет готов</li>
        <li>• Заберите заказ {getPickupInstructions(pickupType)}</li>
        <li>• При получении предъявите номер заказа</li>
      </ul>
    </div>
  );
});

NextSteps.displayName = 'NextSteps';

export default NextSteps;
