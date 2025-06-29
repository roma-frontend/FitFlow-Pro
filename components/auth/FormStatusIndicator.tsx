"use client";

import { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";

interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

interface FormStatusIndicatorProps {
  isFormReady: boolean;
  isValidating: boolean;
  formData: FormData;
  emailValid: boolean;
  isLogin: boolean;
  validationStates: Record<string, ValidationState>;
}

export const FormStatusIndicator = memo(function FormStatusIndicator({
  isFormReady,
  isValidating,
  formData,
  emailValid,
  isLogin,
  validationStates
}: FormStatusIndicatorProps) {
  const getProgress = (): number => {
    if (isFormReady) return 100;
    
    const requiredFields = isLogin 
      ? [formData.email, formData.password]
      : [formData.email, formData.password, formData.name];
    
    const filledFields = requiredFields.filter(Boolean).length;
    return Math.max(20, (filledFields / requiredFields.length) * 100);
  };

  // ✅ Явно определяем булевые значения для StatusItem
  const isEmailCompleted: boolean = Boolean(formData.email && emailValid);
  const isPasswordCompleted: boolean = Boolean(formData.password);
  const isNameCompleted: boolean = Boolean(formData.name && formData.name.length >= 2);
  const areAllValidationsPassed: boolean = Object.values(validationStates).every(
    (state) => state.isValid !== false
  );

  return (
    <Card
      className={`border-2 transition-colors ${
        isFormReady
          ? "bg-green-50 border-green-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">
            {isFormReady ? "✅ Готов к отправке" : "⏳ Заполните форму"}
          </span>
          <div className="flex items-center space-x-2">
            {isValidating && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            {isFormReady && !isValidating && (
              <Shield className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <StatusItem
            completed={isEmailCompleted}
            text="Email проверен и валиден"
          />
          <StatusItem
            completed={isPasswordCompleted}
            text="Пароль введен"
          />
          {!isLogin && (
            <>
              <StatusItem
                completed={isNameCompleted}
                text="Имя указано"
              />
              <StatusItem
                completed={areAllValidationsPassed}
                text="Все проверки пройдены"
              />
            </>
          )}
        </div>

        {/* Прогресс-бар */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isFormReady ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ✅ Явно типизируем пропсы StatusItem
interface StatusItemProps {
  completed: boolean;
  text: string;
}

function StatusItem({ completed, text }: StatusItemProps) {
  return (
    <div className="flex items-center">
      <span
        className={`w-2 h-2 rounded-full mr-2 ${
          completed ? "bg-green-500" : "bg-gray-300"
        }`}
      />
      <span>{text}</span>
    </div>
  );
}
