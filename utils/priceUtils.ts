export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')} ₽`;
};

export const calculateTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const formatCurrency = (amount: number, currency = '₽'): string => {
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
};
