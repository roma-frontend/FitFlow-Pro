// components/EmailValidator.tsx
import React, { useState, useEffect } from 'react';
import { validateEmail, ValidationResult } from '@/utils/validation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EmailValidatorProps {
  email: string;
  onValidationChange: (isValid: boolean) => void;
}

export const EmailValidator: React.FC<EmailValidatorProps> = ({
  email,
  onValidationChange
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!email) {
      setValidation(null);
      onValidationChange(false);
      return;
    }

    const validateEmailAsync = async () => {
      setIsValidating(true);
      try {
        const result = await validateEmail(email);
        setValidation(result);
        onValidationChange(result.isValid);
      } catch (error) {
        console.error('Email validation error:', error);
        setValidation({ isValid: false, errors: ['Ошибка проверки email'] });
        onValidationChange(false);
      } finally {
        setIsValidating(false);
      }
    };

    const timeoutId = setTimeout(validateEmailAsync, 500);
    return () => clearTimeout(timeoutId);
  }, [email, onValidationChange]);

  if (!email) return null;

  return (
    <div className="mt-2">
      {isValidating && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Проверка email...</span>
        </div>
      )}

      {validation && !isValidating && (
        <div className="space-y-2">
          {validation.isValid ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Email адрес корректный</span>
            </div>
          ) : (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {validation.warnings && validation.warnings.length > 0 && (
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
