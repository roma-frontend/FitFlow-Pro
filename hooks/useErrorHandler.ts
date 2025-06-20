// hooks/useErrorHandler.ts (хук для централизованной обработки ошибок)
"use client";

import { useState, useCallback } from "react";

interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    console.error('Error occurred:', error);
    
    if (error instanceof Error) {
      setError({
        message: error.message,
        details: error.stack,
      });
    } else if (typeof error === 'string') {
      setError({
        message: error,
      });
    } else {
      setError({
        message: 'Произошла неизвестная ошибка',
        details: error,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  };
}