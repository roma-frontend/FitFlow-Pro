"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { validateField, VALIDATION_RULES } from '@/utils/formValidationRules';
import { validateEmail } from '@/utils/validation';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  isValidating: boolean;
}

interface UseAdvancedValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
  cacheResults?: boolean;
}

export const useAdvancedValidation = (
  initialData: Record<string, any> = {},
  options: UseAdvancedValidationOptions = {}
) => {
  const {
    debounceMs = 300,
    validateOnMount = false,
    cacheResults = true
  } = options;

  const [formData, setFormData] = useState(initialData);
  const [validationStates, setValidationStates] = useState<Record<string, ValidationState>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const validationCache = useRef<Record<string, ValidationState>>({});

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Валидация поля
  const validateFieldAsync = useCallback(async (
    fieldName: string,
    value: any
  ): Promise<ValidationState> => {
    const cacheKey = `${fieldName}:${value}`;
    
    // Проверяем кэш
    if (cacheResults && validationCache.current[cacheKey]) {
      return validationCache.current[cacheKey];
    }

    // Инициализируем результат
    let result: ValidationState = {
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      isValidating: false
    };

    try {
      // Базовая валидация по правилам
      if (fieldName in VALIDATION_RULES) {
        const basicValidation = validateField(fieldName as keyof typeof VALIDATION_RULES, value);
        
        // Правильно объединяем результаты
        result.isValid = basicValidation.isValid;
        result.errors = [...(basicValidation.errors || [])];
        result.warnings = [...(basicValidation.warnings || [])];
        result.info = [...(basicValidation.info || [])];
      }

      // Специальная валидация для email
      if (fieldName === 'email' && value) {
        try {
          const emailValidation = await validateEmail(value);
          if (!emailValidation.isValid) {
            result.isValid = false;
            result.errors.push(...(emailValidation.errors || []));
          }
          if (emailValidation.warnings && emailValidation.warnings.length > 0) {
            result.warnings.push(...emailValidation.warnings);
          }
        } catch (error) {
          console.warn('Ошибка валидации email:', error);
          // Не блокируем форму из-за ошибки валидации email
        }
      }

      // Специальная валидация для подтверждения пароля
      if (fieldName === 'confirmPassword' && value) {
        const passwordMatch = value === formData.password;
        if (!passwordMatch) {
          result.isValid = false;
          result.errors.push('Пароли не совпадают');
        }
      }

      // Кэшируем результат
      if (cacheResults) {
        validationCache.current[cacheKey] = result;
      }

      return result;
    } catch (error) {
      console.error(`Ошибка валидации поля ${fieldName}:`, error);
      return {
        isValid: false,
        errors: ['Ошибка валидации'],
        warnings: [],
        info: [],
        isValidating: false
      };
    }
  }, [formData.password, cacheResults]);

  // Валидация поля с debounce
  const validateFieldWithDebounce = useCallback((fieldName: string, value: any) => {
    // Очищаем предыдущий таймер
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }

    // Устанавливаем состояние "валидация в процессе"
    setValidationStates(prev => {
      const currentState = prev[fieldName] || {
        isValid: true,
        errors: [],
        warnings: [],
        info: [],
        isValidating: false
      };

      return {
        ...prev,
        [fieldName]: {
          ...currentState,
          isValidating: true
        }
      };
    });

    // Создаем новый таймер
    debounceTimers.current[fieldName] = setTimeout(async () => {
      const result = await validateFieldAsync(fieldName, value);
      
      setValidationStates(prev => ({
        ...prev,
        [fieldName]: result
      }));

      delete debounceTimers.current[fieldName];
    }, debounceMs);
  }, [validateFieldAsync, debounceMs]);

  // Обновление данных формы
  const updateField = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Запускаем валидацию только если поле не пустое или это обязательное поле
    if (value || ['email', 'password', 'name', 'confirmPassword'].includes(fieldName)) {
      validateFieldWithDebounce(fieldName, value);
    } else {
      // Очищаем валидацию для пустых необязательных полей
      setValidationStates(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    }
  }, [validateFieldWithDebounce]);

  // Валидация всей формы
  const validateForm = useCallback(async () => {
    const results: Record<string, ValidationState> = {};
    
    for (const [fieldName, value] of Object.entries(formData)) {
      if (value || ['email', 'password', 'name', 'confirmPassword'].includes(fieldName)) {
        results[fieldName] = await validateFieldAsync(fieldName, value);
      }
    }
    
    setValidationStates(results);
    return results;
  }, [formData, validateFieldAsync]);

  // Проверка валидности всей формы
  useEffect(() => {
    const states = Object.values(validationStates);
    const hasErrors = states.some(state => 
      state && (!state.isValid || (state.errors && state.errors.length > 0))
    );
    
    const requiredFields = ['email', 'password'];
    const hasRequiredFields = requiredFields.every(field => 
      formData[field] && formData[field].trim()
    );
    
    // Для формы регистрации также проверяем имя и подтверждение пароля
    const isRegisterForm = 'name' in formData && 'confirmPassword' in formData;
    if (isRegisterForm) {
      const hasRegisterFields = formData.name && formData.name.trim() && 
                               formData.confirmPassword && formData.confirmPassword.trim();
      setIsFormValid(!hasErrors && hasRequiredFields && hasRegisterFields);
    } else {
      setIsFormValid(!hasErrors && hasRequiredFields);
    }
  }, [validationStates, formData]);

  // Валидация при монтировании (если включена)
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount, validateForm]);

  // Получение состояния конкретного поля
  const getFieldState = useCallback((fieldName: string): ValidationState => {
    return validationStates[fieldName] || {
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      isValidating: false
    };
  }, [validationStates]);

  // Очистка валидации
  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationStates(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
      
      // Очищаем кэш для этого поля
      if (cacheResults) {
        Object.keys(validationCache.current).forEach(key => {
          if (key.startsWith(`${fieldName}:`)) {
            delete validationCache.current[key];
          }
        });
      }
    } else {
      setValidationStates({});
      validationCache.current = {};
    }
  }, [cacheResults]);

  // Сброс формы
  const resetForm = useCallback(() => {
    setFormData(initialData);
    clearValidation();
  }, [initialData, clearValidation]);

  // Безопасные геттеры с проверкой на undefined
  const hasErrors = Object.values(validationStates).some(state => 
    state && state.errors && state.errors.length > 0
  );
  
  const hasWarnings = Object.values(validationStates).some(state => 
    state && state.warnings && state.warnings.length > 0
  );
  
  const isValidating = Object.values(validationStates).some(state => 
    state && state.isValidating
  );
  
  const totalErrors = Object.values(validationStates).reduce((sum, state) => 
    sum + (state && state.errors ? state.errors.length : 0), 0
  );
  
  const totalWarnings = Object.values(validationStates).reduce((sum, state) => 
    sum + (state && state.warnings ? state.warnings.length : 0), 0
  );

  return {
    formData,
    validationStates,
    isFormValid,
    updateField,
    validateForm,
    getFieldState,
    clearValidation,
    resetForm,
    // Вспомогательные геттеры
    hasErrors,
    hasWarnings,
    isValidating,
    // Статистика
    totalErrors,
    totalWarnings
  };
};
