// utils/analyticsUtils.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getGrowthColor = (growth: number): string => {
  return growth >= 0 ? 'text-green-600' : 'text-red-600';
};

export const getGrowthBgColor = (growth: number): string => {
  return growth >= 0 ? 'bg-green-100' : 'bg-red-100';
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const getLoadColor = (load: number): string => {
  if (load > 80) return 'bg-red-500';
  if (load > 60) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const getRankingColor = (index: number): string => {
  switch (index) {
    case 0: return 'bg-yellow-100 text-yellow-800';
    case 1: return 'bg-gray-100 text-gray-800';
    case 2: return 'bg-orange-100 text-orange-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};
