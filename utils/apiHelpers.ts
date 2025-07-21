import { ApiResponse } from "@/types/common";

// utils/apiHelpers.ts
export class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public code?: string
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  export const createApiResponse = <T>(
    data?: T,
    error?: string,
    success: boolean = true
  ): ApiResponse<T> => ({
    success,
    data,
    error
  });
  
  export const handleApiError = (error: unknown): ApiError => {
    if (error instanceof ApiError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new ApiError(error.message, 500);
    }
    
    return new ApiError('Неизвестная ошибка', 500);
  };