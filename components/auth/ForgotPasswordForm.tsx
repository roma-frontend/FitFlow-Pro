"use client";

import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ValidatedInput";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

interface ForgotPasswordFormProps {
  onBack: () => void;
  initialEmail?: string;
}

export const ForgotPasswordForm = memo(function ForgotPasswordForm({
  onBack,
  initialEmail = ""
}: ForgotPasswordFormProps) {
  const [resetEmail, setResetEmail] = useState(initialEmail);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите email адрес",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          userType: "member",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetSent(true);
        toast({
          title: "Письмо отправлено! 📧",
          description: "Проверьте вашу почту для восстановления пароля",
        });
      } else {
        throw new Error(data.error || "Ошибка отправки письма");
      }
    } catch (error) {
      console.error("Ошибка восстановления пароля:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось отправить письмо",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {resetSent ? "Письмо отправлено" : "Восстановление пароля"}
        </CardTitle>
        <CardDescription className="text-base">
          {resetSent
            ? "Проверьте вашу почту и следуйте инструкциям"
            : "Введите email для восстановления пароля"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {resetSent ? (
          <ResetSentContent 
            resetEmail={resetEmail}
            onResend={() => {
              setResetSent(false);
              setResetEmail("");
            }}
            onBack={onBack}
            loading={loading}
          />
        ) : (
          <ResetFormContent
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
            onSubmit={handlePasswordReset}
            onBack={onBack}
            loading={loading}
          />
        )}
      </CardContent>
    </Card>
  );
});

function ResetSentContent({ 
  resetEmail, 
  onResend, 
  onBack, 
  loading 
}: {
  resetEmail: string;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <Mail className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <p className="text-green-800 font-medium">
          Письмо с инструкциями отправлено на {resetEmail}
        </p>
        <p className="text-green-600 text-sm mt-2">
          Проверьте папку "Спам", если письмо не пришло в течение 5 минут
        </p>
      </div>

      <div className="space-y-2">
        <Button
          onClick={onResend}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          Отправить повторно
        </Button>

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к входу
        </Button>
      </div>
    </div>
  );
}

function ResetFormContent({
  resetEmail,
  setResetEmail,
  onSubmit,
  onBack,
  loading
}: {
  resetEmail: string;
  setResetEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email адрес *
        </label>
        <ValidatedInput
          type="email"
          name="resetEmail"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="h-11 w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Введите email, который вы использовали при регистрации
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading || !resetEmail.trim()}
        className="w-full h-11"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Отправляем...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Отправить инструкции
          </>
        )}
      </Button>

      <Button
        type="button"
        onClick={onBack}
        variant="ghost"
        className="w-full"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Вернуться к входу
      </Button>
    </form>
  );
}
