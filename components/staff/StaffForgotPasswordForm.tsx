// components/staff/StaffForgotPasswordForm.tsx - улучшенная версия
"use client";

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ValidatedInput";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

interface StaffForgotPasswordFormProps {
  resetEmail: string;
  resetSent: boolean;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBack: () => void;
  onResend: () => void;
}

export const StaffForgotPasswordForm = memo(function StaffForgotPasswordForm({
  resetEmail,
  resetSent,
  isLoading,
  onEmailChange,
  onSubmit,
  onBack,
  onResend
}: StaffForgotPasswordFormProps) {
  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {resetSent ? "Письмо отправлено" : "Восстановление пароля"}
        </CardTitle>
        <p className="text-gray-600 text-base">
          {resetSent
            ? "Проверьте вашу почту и следуйте инструкциям"
            : "Введите корпоративный email для восстановления пароля"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {resetSent ? (
          <ResetSentContent 
            resetEmail={resetEmail}
            onResend={onResend}
            onBack={onBack}
            isLoading={isLoading}
          />
        ) : (
          <ResetFormContent
            resetEmail={resetEmail}
            onEmailChange={onEmailChange}
            onSubmit={onSubmit}
            onBack={onBack}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
});

const ResetSentContent = memo(function ResetSentContent({
  resetEmail,
  onResend,
  onBack,
  isLoading
}: {
  resetEmail: string;
  onResend: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <p className="text-green-800 font-medium text-lg mb-2">
          Письмо отправлено!
        </p>
        <p className="text-green-700 mb-3">
          Инструкции по восстановлению пароля отправлены на:
        </p>
        <p className="text-green-900 font-medium bg-white/60 px-3 py-2 rounded-lg">
          {resetEmail}
        </p>
        <p className="text-green-600 text-sm mt-3">
          Проверьте папку "Спам", если письмо не пришло в течение 5 минут
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onResend}
          variant="outline"
          className="w-full h-12 hover:bg-blue-50"
          disabled={isLoading}
        >
          <Mail className="h-4 w-4 mr-2" />
          Отправить повторно
        </Button>

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full h-10 hover:bg-gray-100"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к входу
        </Button>
      </div>
    </div>
  );
});

const ResetFormContent = memo(function ResetFormContent({
  resetEmail,
  onEmailChange,
  onSubmit,
  onBack,
  isLoading
}: {
  resetEmail: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Email адрес персонала <span className="text-red-500">*</span>
        </label>
        <ValidatedInput
          type="email"
          name="resetEmail"
          value={resetEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your.email@company.com"
          required
          className="h-12 w-full px-4 transition-all duration-200"
        />
        <p className="text-xs text-gray-500">
          Используйте корпоративный email адрес, зарегистрированный в системе
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading || !resetEmail.trim()}
          className={`w-full h-12 text-base font-medium transition-all duration-300 ${
            !isLoading && resetEmail.trim()
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl text-white'
              : 'bg-gray-400 cursor-not-allowed text-gray-600'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Отправляем инструкции...
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Отправить инструкции
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="w-full h-10 hover:bg-gray-100"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к входу
        </Button>
      </div>
    </form>
  );
});
