// hooks/useAuthFormSafe.ts
"use client";

import { useAuthForm } from "./useAuthForm";
import { Suspense } from "react";

// Обертка для безопасного использования useAuthForm
export function useAuthFormSafe() {
  // В серверном рендеринге возвращаем заглушку
  if (typeof window === 'undefined') {
    return {
      isLogin: true,
      loading: false,
      error: "",
      emailValid: false,
      formData: {
        email: "",
        password: "",
        name: "",
        phone: "",
        role: ""
      },
      validationStates: {},
      isValidating: false,
      isFormReady: false,
      isRedirecting: false,
      showFullScreenLoader: false,
      registrationSuccess: false,
      registrationEmail: "",
      handleFieldChange: () => {},
      handleSubmit: async () => {},
      toggleMode: () => {},
      fillFormData: () => {},
      clearForm: () => {},
      resetRegistrationSuccess: () => {},
      setRegistrationSuccess: () => {},
      redirectParam: null,
    };
  }

  // В клиентском рендеринге используем настоящий хук
  return useAuthForm();
}