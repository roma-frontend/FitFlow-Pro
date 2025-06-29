// components/EnhancedSmartForm.tsx - обновленная версия для книжного стиля
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from './ValidatedInput';
import { ValidationSummary } from './ValidationSummary';
import { useAdvancedValidation } from '@/hooks/useAdvancedValidation';
import { Loader2, Shield, Zap, CheckCircle } from 'lucide-react';

interface EnhancedSmartFormProps {
  type: 'login' | 'register' | 'staff-login';
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  autoValidate?: boolean;
  showValidationSummary?: boolean;
}

export const EnhancedSmartForm: React.FC<EnhancedSmartFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
  autoValidate = true,
  showValidationSummary = true
}) => {
  // Конфигурация формы
  const getFormConfig = () => {
    switch (type) {
      case 'register':
        return {
          fields: [
            { name: 'name', type: 'text', label: 'Имя', placeholder: 'Введите ваше имя', required: true },
            { name: 'email', type: 'email', label: 'Email', placeholder: 'Введите email', required: true },
            { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Создайте надежный пароль', required: true, showStrength: true },
            { name: 'confirmPassword', type: 'password', label: 'Подтвердите пароль', placeholder: 'Повторите пароль', required: true }
          ],
          title: 'Создание аккаунта',
          description: 'Заполните форму для регистрации',
          submitText: 'Зарегистрироваться',
          icon: Shield
        };
      case 'staff-login':
        return {
          fields: [
            { name: 'role', type: 'select', label: 'Роль', required: true, options: [
              { value: 'admin', label: 'Администратор' },
              { value: 'super-admin', label: 'Супер Администратор' },
              { value: 'manager', label: 'Менеджер' },
              { value: 'trainer', label: 'Тренер' }
            ]},
                        { name: 'email', type: 'email', label: 'Email адрес', placeholder: 'your@email.com', required: true },
            { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Введите пароль', required: true, showToggle: true }
          ],
          title: 'Вход для персонала',
          description: 'Войдите в панель управления',
          submitText: 'Войти в систему',
          icon: Zap
        };
      default: // login
        return {
          fields: [
            { name: 'email', type: 'email', label: 'Email', placeholder: 'Введите email', required: true },
            { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Введите пароль', required: true, showToggle: true }
          ],
          title: 'Вход в систему',
          description: 'Войдите в свой аккаунт',
          submitText: 'Войти',
          icon: Shield
        };
    }
  };

  const config = getFormConfig();
  const IconComponent = config.icon;

  // Инициализация данных формы
  const initialData = config.fields.reduce((acc, field) => {
    acc[field.name] = field.name === 'role' ? 'admin' : '';
    return acc;
  }, {} as Record<string, string>);

  // Используем продвинутую валидацию
  const {
    formData,
    validationStates,
    isFormValid,
    updateField,
    validateForm,
    hasErrors,
    hasWarnings,
    isValidating,
    totalErrors,
    totalWarnings
  } = useAdvancedValidation(initialData, {
    debounceMs: 300,
    validateOnMount: autoValidate,
    cacheResults: true
  });

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;
    
    try {
      const finalValidation = await validateForm();
      const hasValidationErrors = Object.values(finalValidation).some(state => 
        state && (!state.isValid || (state.errors && state.errors.length > 0))
      );
      
      if (hasValidationErrors) {
        console.warn('Форма содержит ошибки валидации');
        return;
      }
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
    }
  };

  // Рендер поля формы
  const renderField = (field: any) => {
    const fieldState = validationStates[field.name] || {
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      isValidating: false
    };
    
    if (field.type === 'select') {
      return (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={formData[field.name] || (field.options?.[0]?.value || '')}
            onChange={(e) => updateField(field.name, e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            required={field.required}
          >
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <ValidatedInput
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            showPasswordToggle={field.showToggle}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          
          {/* ✅ Индикатор успешной валидации */}
          {fieldState.isValid && formData[field.name] && !fieldState.isValidating && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>
        
        {/* Отображение ошибок поля */}
        {fieldState.errors && fieldState.errors.length > 0 && (
          <div className="space-y-1">
            {fieldState.errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 flex-shrink-0" />
                {error}
              </p>
            ))}
          </div>
        )}
        
        {/* Отображение предупреждений */}
        {fieldState.warnings && fieldState.warnings.length > 0 && (
          <div className="space-y-1">
            {fieldState.warnings.map((warning, index) => (
              <p key={index} className="text-sm text-orange-600 flex items-center">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mr-2 flex-shrink-0" />
                {warning}
              </p>
            ))}
          </div>
        )}
        
        {/* Индикатор валидации */}
        {fieldState.isValidating && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Проверка...
          </div>
        )}
      </div>
    );
  };

  // Подсчет прогресса заполнения
  const filledFields = Object.keys(formData).filter(key => formData[key]).length;
  const progressPercentage = Math.round((filledFields / config.fields.length) * 100);

  return (
    <Card className="w-full shadow-xl border-0 bg-white">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">{config.title}</CardTitle>
        <CardDescription className="text-gray-600 text-base">{config.description}</CardDescription>
        
        {/* ✅ Прогресс-бар в заголовке */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Прогресс заполнения
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {config.fields.map(renderField)}

          {/* ✅ Компактная сводка валидации */}
          {showValidationSummary && Object.keys(validationStates).length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <ValidationSummary
                  validationResults={validationStates}
                  showOnlyErrors={false}
                />
              </CardContent>
            </Card>
          )}

          {/* ✅ Улучшенная кнопка отправки */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || !isFormValid || isValidating}
              className={`w-full h-12 text-base font-medium transition-all duration-300 transform ${
                isFormValid && !isValidating
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-[1.02] text-white' 
                  : 'bg-gray-400 cursor-not-allowed text-gray-600'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Создаем аккаунт...
                </>
              ) : isValidating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Проверка данных...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  {config.submitText}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ✅ Компактная статистика полей */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {config.fields.map(field => {
                const isFilled = Boolean(formData[field.name]);
                const fieldState = validationStates[field.name];
                const isValid = !fieldState || fieldState.isValid;
                
                return (
                  <div key={field.name} className="flex items-center text-sm">
                    <span className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                      isFilled && isValid ? 'bg-green-500' :
                      isFilled && !isValid ? 'bg-red-500' :
                      'bg-gray-300'
                    }`} />
                    <span className={`truncate ${
                      isFilled && isValid ? 'text-green-700 font-medium' :
                      isFilled && !isValid ? 'text-red-700' :
                      'text-gray-600'
                    }`}>
                      {field.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Общий статус */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Готовность формы:</span>
                <span className={`font-bold ${
                  isFormValid ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {isFormValid ? '✅ Готово к отправке' : '⏳ Заполните все поля'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Статистика валидации (только в dev режиме) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-gray-700">🔧 Dev: Статистика валидации</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600">Форма валидна:</p>
                  <p className={`font-medium ${isFormValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isFormValid ? '✅ Да' : '❌ Нет'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ошибки:</p>
                  <p className={`font-medium ${totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalErrors}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Предупреждения:</p>
                  <p className={`font-medium ${totalWarnings > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {totalWarnings}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Проверка:</p>
                  <p className={`font-medium ${isValidating ? 'text-blue-600' : 'text-gray-600'}`}>
                    {isValidating ? '🔄 Да' : '⏸️ Нет'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

