// components/SmartForm.tsx - обновленная версия с UniversalSubmitButton
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidatedInput } from "./ValidatedInput";
import { EmailValidator } from "./EmailValidator";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { RoleBasedPasswordValidator } from "./RoleBasedPasswordValidator";
import { useRealTimeValidation } from "@/utils/realTimeValidation";
import { validateEmail, validatePasswordStrength } from "@/utils/validation";
import { Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { UniversalSubmitButton } from "./auth/UniversalSubmitButton";
interface SmartFormProps {
  type: "login" | "register" | "staff-login";
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const SmartForm: React.FC<SmartFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { validationStates, validateField } = useRealTimeValidation();
  const router = useRouter();

  // Конфигурация полей для разных типов форм с учетом окружения
  const getFormConfig = () => {
    switch (type) {
      case "register":
        return {
          fields: ["name", "email", "password", "confirmPassword"],
          title: "Регистрация",
          description: "Создайте новый аккаунт",
          submitText: "Зарегистрироваться",
          showPasswordStrength: true,
          showRoleSelector: false,
        };
      case "staff-login":
        return {
          fields: process.env.NODE_ENV === "development" 
            ? ["role", "email", "password"]
            : ["email", "password"],
          title: "Вход для персонала",
          description: "Войдите в панель управления",
          submitText: "Войти в систему",
          showPasswordStrength: false,
          showRoleSelector: process.env.NODE_ENV === "development",
        };
      default: // login
        return {
          fields: ["email", "password"],
          title: "Вход в систему",
          description: "Войдите в свой аккаунт",
          submitText: "Войти",
          showPasswordStrength: false,
          showRoleSelector: false,
        };
    }
  };

  const config = getFormConfig();

  // Инициализация формы с учетом текущей конфигурации
  useEffect(() => {
    const initialData: Record<string, any> = {};
    config.fields.forEach((field) => {
      initialData[field] = field === "role" ? "admin" : "";
    });
    setFormData(initialData);
  }, [type, config.fields.join(',')]);

  // Обработчик изменения полей
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // Валидация в реальном времени
    if (fieldName === "email" && value) {
      setIsValidating(true);
      validateField("email", value, async (email: string) => {
        const result = await validateEmail(email);
        setIsValidating(false);
        return result;
      });
    }

    if (fieldName === "password" && value) {
      setIsValidating(true);
      validateField("password", value, (password: string) => {
        const result = validatePasswordStrength(password);
        setIsValidating(false);
        return result;
      });
    }

    if (fieldName === "name" && value) {
      setIsValidating(true);
      validateField("name", value, (name: string) => {
        const result = {
          isValid: name.length >= 2 && /^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(name),
          errors:
            name.length < 2
              ? ["Имя слишком короткое"]
              : !/^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(name)
                ? ["Имя может содержать только буквы"]
                : [],
        };
        setIsValidating(false);
        return result;
      });
    }
  };

  // Проверка готовности формы с учетом окружения
  const isFormReady = () => {
    const requiredFields = config.fields.filter((field) => {
      if (field === "role" && process.env.NODE_ENV !== "development") {
        return false;
      }
      return field !== "role";
    });
    
    const allFieldsFilled = requiredFields.every((field) =>
      formData[field]?.trim()
    );

    if (!allFieldsFilled) return false;

    if (config.fields.includes("email") && !emailValid) return false;
    if (
      config.fields.includes("password") &&
      type === "register" &&
      !passwordValid
    )
      return false;
    if (
      config.fields.includes("confirmPassword") &&
      formData.password !== formData.confirmPassword
    )
      return false;

    return true;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormReady() || isLoading || isValidating) return;

    const submitData = { ...formData };
    if (type === "staff-login" && process.env.NODE_ENV !== "development") {
      submitData.role = "admin";
    }

    await onSubmit(submitData);
  };

  // Рендеринг полей с правильной обработкой role
  const renderField = (fieldName: string) => {
    const fieldValidation = validationStates[fieldName];

    if (fieldName === "role") {
      if (process.env.NODE_ENV === "development") {
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Роль *
            </label>
            <Select
              value={formData[fieldName] || "admin"}
              onValueChange={(value) => handleFieldChange(fieldName, value)}
            >
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">👑 Администратор</SelectItem>
                <SelectItem value="super-admin">🔱 Супер Администратор</SelectItem>
                <SelectItem value="manager">👔 Менеджер</SelectItem>
                <SelectItem value="trainer">💪 Тренер</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Выберите вашу роль в системе
            </p>
          </div>
        );
      }
      return null;
    }

    switch (fieldName) {
      case "name":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя *
            </label>
            <ValidatedInput
              type="text"
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder="Введите ваше имя"
              required
              className="w-full"
            />
            {fieldValidation && !fieldValidation.isValid && fieldValidation.errors.length > 0 && (
              <div className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {fieldValidation.errors[0]}
              </div>
            )}
          </div>
        );

      case "email":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <ValidatedInput
              type="email"
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder="Введите email"
              required
              className="w-full"
            />
            <EmailValidator
              email={formData[fieldName] || ""}
              onValidationChange={setEmailValid}
            />
          </div>
        );

      case "password":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль *
            </label>
            <ValidatedInput
              type="password"
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={
                type === "register"
                  ? "Создайте надежный пароль"
                  : "Введите пароль"
              }
              required
              showPasswordToggle
              className="w-full"
            />
            {config.showPasswordStrength && formData[fieldName] && (
              <PasswordStrengthIndicator
                strength={validatePasswordStrength(formData[fieldName])}
                password={formData[fieldName]}
              />
            )}
            {type === "staff-login" && formData[fieldName] && (
              <RoleBasedPasswordValidator
                password={formData[fieldName]}
                role={
                  process.env.NODE_ENV === "development" 
                    ? (formData.role === "admin" || formData.role === "super-admin" ? "admin" : "staff")
                    : "admin"
                }
                onValidationChange={setPasswordValid}
              />
            )}
          </div>
        );

      case "confirmPassword":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подтвердите пароль *
            </label>
            <ValidatedInput
              type="password"
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder="Повторите пароль"
              required
              className="w-full"
            />
            {formData[fieldName] &&
              formData.password !== formData[fieldName] && (
                <div className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Пароли не совпадают
                </div>
              )}
            {formData[fieldName] &&
              formData.password === formData[fieldName] &&
              formData.password && (
                <div className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Пароли совпадают
                </div>
              )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-xl mx-auto lg:mx-0">
      <CardHeader className="text-center">
        <Button 
          onClick={() => router.push("/")} 
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all"
        >
          <Shield className="h-8 w-8 text-white" />
        </Button>
        <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 mt-2 p-2 bg-yellow-50 rounded">
            🔧 Dev Mode: Showing all fields including role selector
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((fieldName) => renderField(fieldName))}

          {/* ✅ Используем UniversalSubmitButton вместо обычной Button */}
          <UniversalSubmitButton
            type={type}
            loading={isLoading}
            isFormReady={isFormReady()}
            isValidating={isValidating}
            submitText={config.submitText}
          />
        </form>

        {/* Индикатор готовности формы */}
        <div className="mt-4">
          <Card
            className={`border-2 transition-colors ${
              isFormReady()
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {isFormReady() ? "✅ Готов к отправке" : "⏳ Заполните форму"}
                </span>
                {isFormReady() && !isValidating && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {isValidating && (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
              </div>

              <div className="mt-2 space-y-1 text-xs">
                {config.fields.map((field) => {
                  const isFieldValid =
                    field === "role" ||
                    (field === "email"
                      ? emailValid
                      : field === "password" && type === "register"
                        ? passwordValid
                        : field === "confirmPassword"
                          ? formData.password === formData[field]
                          : Boolean(formData[field]?.trim()));

                  const getFieldLabel = (fieldName: string) => {
                    switch (fieldName) {
                      case "confirmPassword": return "Подтверждение пароля";
                      case "email": return "Email";
                      case "password": return "Пароль";
                      case "name": return "Имя";
                      case "role": return "Роль";
                      default: return fieldName;
                    }
                  };

                  return (
                    <div key={field} className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          isFieldValid ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <span>
                        {getFieldLabel(field)}
                        {process.env.NODE_ENV === "development" && field === "role" && (
                          <span className="text-yellow-600 ml-1">(dev only)</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {process.env.NODE_ENV !== "development" && type === "staff-login" && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  ℹ️ В production режиме роль устанавливается автоматически
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};