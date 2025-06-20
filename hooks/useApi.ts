"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const request = async <T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      method = 'GET',
      body,
      headers = {},
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Операция выполнена успешно',
      errorMessage = 'Произошла ошибка'
    } = options;

    setLoading(true);

    try {
      const config: RequestInit = {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (data.success) {
        if (showSuccessToast) {
          toast({
            title: "Успех",
            description: data.message || successMessage,
            variant: "default", // или "success" если у вас есть такой вариант
          });
        }
        return { success: true, data: data.data || data };
      } else {
        if (showErrorToast) {
          toast({
            title: "Ошибка",
            description: data.error || errorMessage,
            variant: "destructive",
          });
        }
        return { success: false, error: data.error || errorMessage };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      if (showErrorToast) {
        toast({
          title: "Ошибка сети",
          description: errorMsg,
          variant: "destructive",
        });
      }
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Специализированные методы
  const get = <T = any>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'GET' });

  const post = <T = any>(url: string, body?: any, options?: Omit<ApiOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'POST', body });

  const put = <T = any>(url: string, body?: any, options?: Omit<ApiOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PUT', body });

  const del = <T = any>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'DELETE' });

  const patch = <T = any>(url: string, body?: any, options?: Omit<ApiOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PATCH', body });

  // Дополнительные утилиты для работы с уведомлениями
  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  return {
    loading,
    request,
    get,
    post,
    put,
    delete: del,
    patch,
    user,
    // Экспортируем утилиты для уведомлений
    showSuccess,
    showError,
    showInfo
  };
}
