// hooks/useAuthForm.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ С ОДНИМ ЛОАДЕРОМ

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLoaderStore } from "@/stores/loaderStore";
import { validateEmailFormat, validateName, validatePassword } from "@/utils/authValidation";

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
}

export function useAuthForm() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState<boolean>(false);
  
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [registrationEmail, setRegistrationEmail] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: ""
  });
  
  const [validationStates, setValidationStates] = useState<
    Record<string, ValidationState>
  >({});
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectParam = searchParams.get('redirect');
  
  const { login: authLogin, user: authUser, loading: authLoading } = useAuth();

  const showLoader = useLoaderStore((state) => state.showLoader);
  const hideLoader = useLoaderStore((state) => state.hideLoader);

  // ✅ НОВОЕ: Флаг для предотвращения множественных вызовов loader
  const loaderShownRef = useCallback(() => {
    return Boolean(showFullScreenLoader);
  }, [showFullScreenLoader]);

  // Инициализация формы при смене режима
  useEffect(() => {
    if (isLogin) {
      setFormData((prev) => ({
        email: prev.email,
        password: prev.password,
        name: "",
        phone: "",
        role: ""
      }));
      setRegistrationSuccess(false);
      setRegistrationEmail("");
    } else {
      setFormData((prev) => ({
        email: prev.email,
        password: "",
        name: "",
        phone: "",
        role: ""
      }));
    }
    setError("");
  }, [isLogin]);

  // ✅ ОБНОВЛЕНО: Обработка автоматического редиректа для уже авторизованных
  useEffect(() => {
    if (!authLoading && authUser && authUser.role === "member" && !loaderShownRef()) {
      console.log("✅ Пользователь уже авторизован, обрабатываем redirect:", redirectParam);
      
      let targetUrl = "/member-dashboard";
      
      if (redirectParam) {
        try {
          const decodedRedirect = decodeURIComponent(redirectParam);
          if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
            targetUrl = decodedRedirect;
            console.log("🎯 Перенаправляем на запрошенную страницу:", targetUrl);
          }
        } catch (error) {
          console.error("❌ Ошибка декодирования redirect");
        }
      }
      
      // Показываем loader один раз
      setIsRedirecting(true);
      setShowFullScreenLoader(true);
      
      showLoader("login", {
        userRole: authUser.role,
        userName: authUser.name || authUser.email?.split('@')[0],
        dashboardUrl: targetUrl
      });
      
      // Делаем редирект
      setTimeout(() => {
        router.replace(targetUrl);
      }, 100);
    }
  }, [authUser, authLoading, router, redirectParam, showLoader, loaderShownRef]);

  // Валидация email с debounce
  useEffect(() => {
    if (!formData.email) {
      setEmailValid(false);
      setValidationStates((prev) => {
        const newState = { ...prev };
        delete newState.email;
        return newState;
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        setIsValidating(true);
        const validation = validateEmailFormat(formData.email);
        setEmailValid(validation.isValid);

        setValidationStates((prev) => ({
          ...prev,
          email: validation,
        }));
      } catch (error) {
        console.error("Ошибка валидации email:", error);
        setEmailValid(false);
        setValidationStates((prev) => ({
          ...prev,
          email: {
            isValid: false,
            errors: ["Ошибка проверки email"],
          },
        }));
      } finally {
        setIsValidating(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Валидация имени
  useEffect(() => {
    if (!isLogin && formData.name) {
      const timeoutId = setTimeout(() => {
        const validation = validateName(formData.name);
        setValidationStates((prev) => ({
          ...prev,
          name: validation,
        }));
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (isLogin) {
      setValidationStates((prev) => {
        const newState = { ...prev };
        delete newState.name;
        return newState;
      });
    }
  }, [formData.name, isLogin]);

  // Валидация пароля
  useEffect(() => {
    if (formData.password) {
      const timeoutId = setTimeout(() => {
        const validation = validatePassword(formData.password, isLogin);
        setValidationStates((prev) => ({
          ...prev,
          password: validation,
        }));
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setValidationStates((prev) => {
        const newState = { ...prev };
        delete newState.password;
        return newState;
      });
    }
  }, [formData.password, isLogin]);

  // Мемоизированная проверка готовности формы
  const isFormReady = useMemo<boolean>(() => {
    if (isLogin) {
      return Boolean(formData.email && formData.password && emailValid);
    }

    const nameValid = Boolean(formData.name && formData.name.length >= 2);
    const passwordValid = Boolean(formData.password && formData.password.length >= 6);
    return Boolean(nameValid && formData.email && passwordValid && emailValid);
  }, [isLogin, formData, emailValid]);

  // Обработчик изменения полей
  const handleFieldChange = useCallback(
    (fieldName: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      if (error) setError("");
    },
    [error]
  );

  // ✅ ОБНОВЛЕНО: Обработчик отправки формы - показываем loader ОДИН раз
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormReady || loading || isValidating || isRedirecting) return;

    setLoading(true);
    setError("");

    try {
      const emailValidation = validateEmailFormat(formData.email);
      if (!emailValidation.isValid) {
        setError(`Ошибка email: ${emailValidation.errors.join(", ")}`);
        setLoading(false);
        return;
      }

      if (isLogin) {
        console.log("🔐 Вход участника, redirectParam:", redirectParam);
        
        // ✅ Показываем loader ОДИН раз в начале процесса
        setShowFullScreenLoader(true);
        setIsRedirecting(true);
        
        const targetUrl = redirectParam || "/member-dashboard";
        
        showLoader("login", {
          userRole: "member",
          userName: formData.email.split('@')[0],
          dashboardUrl: targetUrl
        });
        
        // Вызываем authLogin БЕЗ повторного показа loader в useAuth
        const success = await authLogin(
          formData.email.trim().toLowerCase(),
          formData.password,
          redirectParam || undefined
        );

        if (success) {
          console.log("✅ Успешный вход участника");
          
          sessionStorage.setItem('show_welcome_toast', 'true');
          sessionStorage.setItem('welcome_user_role', 'member');
          
          // Loader остается активным до завершения редиректа
          // НЕ вызываем hideLoader здесь!
          
          return { 
            success: true,
            message: "Перенаправление..."
          };
        } else {
          // Скрываем loader только при ошибке
          hideLoader();
          setShowFullScreenLoader(false);
          setIsRedirecting(false);
          throw new Error("Неверный email или пароль");
        }
      } else {
        // РЕГИСТРАЦИЯ
        console.log("📝 Регистрация участника");
        
        const endpoint = "/api/auth/member-register";
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
        };

        console.log("🚀 Регистрация через API:", endpoint);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          console.log("✅ Успешная регистрация");
          
          setRegistrationSuccess(true);
          setRegistrationEmail(formData.email);
          
          toast({
            title: "Регистрация завершена! 🎉",
            description: "Проверьте почту для подтверждения аккаунта",
          });
          
          return { success: true };
        } else {
          throw new Error(data.error || `Ошибка ${response.status}`);
        }
      }
    } catch (error) {
      console.error("💥 Ошибка:", error);
      
      // Скрываем loader при ошибке
      if (showFullScreenLoader) {
        hideLoader();
        setShowFullScreenLoader(false);
      }
      
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось выполнить операцию";
      setError(errorMessage);
      setIsRedirecting(false);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setError("");
    setRegistrationSuccess(false);
    setRegistrationEmail("");
  }, []);

  const fillFormData = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  const clearForm = useCallback(() => {
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
      role: ""
    });
    setEmailValid(false);
    setValidationStates({});
    setRegistrationSuccess(false);
    setRegistrationEmail("");
  }, []);

  const resetRegistrationSuccess = useCallback(() => {
    setRegistrationSuccess(false);
    setRegistrationEmail("");
  }, []);

  return {
    // Состояние
    isLogin: Boolean(isLogin),
    loading: Boolean(loading || authLoading || isRedirecting),
    error,
    emailValid: Boolean(emailValid),
    formData,
    validationStates,
    isValidating: Boolean(isValidating),
    isFormReady: Boolean(isFormReady),
    isRedirecting: Boolean(isRedirecting),
    showFullScreenLoader: Boolean(showFullScreenLoader),
    
    // Состояния регистрации
    registrationSuccess: Boolean(registrationSuccess),
    registrationEmail,

    // Действия
    handleFieldChange,
    handleSubmit,
    toggleMode,
    fillFormData,
    clearForm,
    resetRegistrationSuccess,
    setRegistrationSuccess,
    
    redirectParam,
  };
}