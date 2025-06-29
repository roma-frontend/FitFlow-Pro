// utils/realTimeValidation.ts
import { useState, useEffect, useCallback } from 'react';

export class RealTimeValidator {
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number = 300
  ): T {
    return ((...args: any[]) => {
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(key);
      }, delay);

      this.debounceTimers.set(key, timer);
    }) as T;
  }

  cleanup() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Создаем глобальный экземпляр валидатора
export const realTimeValidator = new RealTimeValidator();

// Хук для валидации в реальном времени
export const useRealTimeValidation = () => {
  const [validationStates, setValidationStates] = useState<Record<string, any>>({});

  const validateField = useCallback(
    realTimeValidator.debounce('field-validation', async (
      fieldName: string,
      value: any,
      validator: (value: any) => Promise<any> | any
    ) => {
      try {
        const result = await validator(value);
        setValidationStates(prev => ({
          ...prev,
          [fieldName]: result
        }));
      } catch (error) {
        setValidationStates(prev => ({
          ...prev,
          [fieldName]: { isValid: false, errors: ['Ошибка валидации'] }
        }));
      }
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      realTimeValidator.cleanup();
    };
  }, []);

  return { validationStates, validateField };
};
