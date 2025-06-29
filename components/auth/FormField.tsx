// components/auth/FormField.tsx - исправленная версия
"use client";

import { memo } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { ValidatedInput } from "@/components/ValidatedInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { validatePasswordStrength } from "@/utils/validation";

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

interface FormFieldProps {
  fieldName: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  validationState?: ValidationState;
  isValidating?: boolean;
  isLogin?: boolean;
}

export const FormField = memo(function FormField({
  fieldName,
  label,
  placeholder,
  type = "text",
  required = true,
  value,
  onChange,
  validationState,
  isValidating = false,
  isLogin = true
}: FormFieldProps) {
  const hasPasswordToggle = type === "password";
  const isValid = validationState?.isValid && value && !isValidating;
  const hasErrors = validationState && !validationState.isValid && validationState.errors.length > 0;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
        {fieldName === "password" && !isLogin && (
          <span className="text-xs text-gray-500 ml-1">
            (минимум 8 символов для надежности)
          </span>
        )}
      </label>
      
      <div className="relative">
        <ValidatedInput
          type={type as any}
          name={fieldName}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          showPasswordToggle={hasPasswordToggle}
          className={`h-12 w-full px-4 transition-all duration-200 ${
            hasPasswordToggle ? 'pr-20' : 'pr-12'
          } ${
            hasErrors
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : isValid
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        
        {/* ✅ Индикатор успешной валидации - НЕ для полей с паролем и email */}
        {fieldName !== "email" && !hasPasswordToggle && isValid && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
        )}
        
        {/* ✅ Для полей с паролем показываем галочку слева от кнопки глаза */}
        {hasPasswordToggle && isValid && (
          <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Email валидация */}
      {fieldName === "email" && value && (
        <EmailValidationDisplay 
          isValidating={isValidating}
          validationState={validationState}
        />
      )}

      {/* Индикатор силы пароля для регистрации */}
      {fieldName === "password" && !isLogin && value && (
        <div className="mt-3">
          <PasswordStrengthIndicator
            strength={validatePasswordStrength(value)}
            password={value}
          />
        </div>
      )}

      {/* Отображение ошибок других полей */}
      {fieldName !== "email" && validationState && !validationState.isValid && validationState.errors.length > 0 && (
        <div className="space-y-1">
          {validationState.errors.map((error: string, index: number) => (
            <p
              key={index}
              className="text-sm text-red-600 flex items-center"
            >
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 flex-shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Предупреждения для других полей */}
      {fieldName !== "email" && validationState?.warnings && validationState.warnings.length > 0 && (
        <div className="space-y-1">
          {validationState.warnings.map((warning: string, index: number) => (
            <p
              key={index}
              className="text-sm text-orange-600 flex items-center"
            >
              <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mr-2 flex-shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      )}

      {/* ✅ Подсказки для полей (только если нет ошибок и предупреждений) */}
      {!validationState?.errors?.length && !validationState?.warnings?.length && !value && (
        <div className="text-xs text-gray-500 mt-1">
          {fieldName === 'email' && "Мы проверим реальность вашего email адреса"}
          {fieldName === 'password' && isLogin && "Введите ваш пароль"}
          {fieldName === 'password' && !isLogin && "Создайте надежный пароль с буквами, цифрами и символами"}
          {fieldName === 'name' && "Укажите ваше полное имя"}
          {fieldName === 'phone' && "Необязательно, но поможет в экстренных случаях"}
        </div>
      )}
    </div>
  );
});

// ✅ Улучшенный компонент отображения валидации email
function EmailValidationDisplay({ 
  isValidating, 
  validationState 
}: { 
  isValidating: boolean; 
  validationState?: ValidationState; 
}) {
  return (
    <div className="mt-2">
      {isValidating ? (
        <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Проверяем email адрес...</span>
        </div>
      ) : validationState ? (
        <div className="space-y-2">
          {validationState.isValid ? (
            <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Email адрес корректный и существует</span>
            </div>
          ) : (
            <div className="space-y-2">
              {validationState.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Предупреждения для email */}
          {validationState.warnings?.map((warning, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}