// components/book-trainer/utils/priceUtils.ts
export const formatPrice = (price: number, currency: string = "₽") => {
  return `${Math.round(price)} ${currency}`;
};

export const calculateTotalPrice = (hourlyRate: number, durationMinutes: number) => {
  return hourlyRate * (durationMinutes / 60);
};

export const getPriceCategory = (price: number) => {
  if (price <= 2000) return "budget";
  if (price <= 3500) return "medium";
  return "premium";
};
