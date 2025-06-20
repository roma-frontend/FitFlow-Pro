// hooks/useFormValidation.ts
import { useState, useEffect } from 'react';
import { validateRegistrationForm, validateLoginForm, ValidationResult } from '@/utils/validation';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useRegistrationValidation = (formData: RegistrationData) => {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: false, errors: [] });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateForm = async () => {
      if (!formData.name && !formData.email && !formData.password && !formData.confirmPassword) {
        setValidation({ isValid: false, errors: [] });
        return;
      }

      setIsValidating(true);
      try {
        const result = await validateRegistrationForm(formData);
        setValidation(result);
      } catch (error) {
        console.error('Validation error:', error);
        setValidation({ isValid: false, errors: ['Ошибка валидации'] });
      } finally {
        setIsValidating(false);
      }
    };

    const timeoutId = setTimeout(validateForm, 300);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  return { validation, isValidating };
};

export const useLoginValidation = (formData: LoginData) => {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: false, errors: [] });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateForm = async () => {
      if (!formData.email && !formData.password) {
        setValidation({ isValid: false, errors: [] });
        return;
      }

      setIsValidating(true);
      try {
        const result = await validateLoginForm(formData);
        setValidation(result);
      } catch (error) {
        console.error('Validation error:', error);
        setValidation({ isValid: false, errors: ['Ошибка валидации'] });
      } finally {
        setIsValidating(false);
      }
    };

    const timeoutId = setTimeout(validateForm, 300);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  return { validation, isValidating };
};
