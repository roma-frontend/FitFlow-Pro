// hooks/useAsyncState.ts
import { useState, useCallback } from 'react';
import type { AsyncState, FormValidationResult, LoadingState } from '../types/common';

export const useAsyncState = <T = any>(
  initialData: T | null = null
): [
  AsyncState<T>,
  {
    setData: (data: T) => void;
    setLoading: (loading: LoadingState) => void;
    setError: (error: string | null) => void;
    reset: () => void;
  }
] => {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: 'idle',
    error: null
  });

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, loading: 'success', error: null }));
  }, []);

  const setLoading = useCallback((loading: LoadingState) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: 'error' }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: 'idle', error: null });
  }, [initialData]);

  return [state, { setData, setLoading, setError, reset }];
};

// utils/validators.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePrice = (price: number): FormValidationResult => {
  const errors: string[] = [];
  
  if (price <= 0) {
    errors.push('Цена должна быть больше 0');
  }
  
  if (price > 1000000) {
    errors.push('Цена не должна превышать 1,000,000 рублей');
  }
  
  if (!Number.isInteger(price)) {
    errors.push('Цена должна быть целым числом');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDuration = (duration: number): FormValidationResult => {
  const errors: string[] = [];
  
  if (duration <= 0) {
    errors.push('Длительность должна быть больше 0');
  }
  
  if (duration > 3650) {
    errors.push('Длительность не должна превышать 10 лет');
  }
  
  if (!Number.isInteger(duration)) {
    errors.push('Длительность должна быть целым числом');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// utils/formatters.ts
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatDuration = (duration: number): string => {
  if (duration === 30) return 'Месячный';
  if (duration === 90) return 'Квартальный';
  if (duration === 180) return 'Полугодовой';
  if (duration === 365) return 'Годовой';
  
  if (duration < 30) {
    return `${duration} ${getDaysWord(duration)}`;
  }
  
  const months = Math.floor(duration / 30);
  const days = duration % 30;
  
  if (days === 0) {
    return `${months} ${getMonthsWord(months)}`;
  }
  
  return `${months} ${getMonthsWord(months)} ${days} ${getDaysWord(days)}`;
};

const getDaysWord = (days: number): string => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
  return 'дней';
};

const getMonthsWord = (months: number): string => {
  if (months % 10 === 1 && months % 100 !== 11) return 'месяц';
  if ([2, 3, 4].includes(months % 10) && ![12, 13, 14].includes(months % 100)) return 'месяца';
  return 'месяцев';
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
};
