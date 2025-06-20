// lib/api/products.ts
import type { Product, ProductFormData } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Типы для API ответов
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Функции для работы с API
export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();

  // ✅ Добавляем timestamp для обхода кэша
  searchParams.set('_t', Date.now().toString());

  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`${API_BASE_URL}/products?${searchParams}`, {
    // ✅ Принудительно обходим кэш
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const result: ApiResponse<Product[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch products');
  }

  return result.data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  const result: ApiResponse<Product> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch product');
  }

  return result.data;
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  console.log('🔄 API createProduct: отправляем данные:', data);

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('📡 API createProduct: статус ответа:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API createProduct: ошибка ответа:', errorData);
    throw new Error(errorData.error || `Failed to create product: ${response.statusText}`);
  }

  const result: ApiResponse<Product> = await response.json();
  console.log('📦 API createProduct: результат:', result);

  if (!result.success) {
    console.error('❌ API createProduct: success = false:', result);
    throw new Error(result.message || 'Failed to create product');
  }

  console.log('✅ API createProduct: продукт создан:', result.data);
  return result.data;
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  console.log('🔄 API updateProduct: отправляем данные:', { id, data });

  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('📡 API updateProduct: статус ответа:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API updateProduct: ошибка ответа:', errorData);
    throw new Error(errorData.error || `Failed to update product: ${response.statusText}`);
  }

  const result: ApiResponse<Product> = await response.json();
  console.log('📦 API updateProduct: результат:', result);

  if (!result.success) {
    console.error('❌ API updateProduct: success = false:', result);
    throw new Error(result.message || 'Failed to update product');
  }

  console.log('✅ API updateProduct: продукт обновлен:', result.data);
  return result.data;
}

export async function deleteProduct(id: string, deleteType: 'soft' | 'hard' = 'soft'): Promise<void> {
  console.log('🔄 API deleteProduct called:', { id, deleteType });

  const response = await fetch(`${API_BASE_URL}/products/${id}?type=${deleteType}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 Delete Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Delete Response error:', errorData);
    throw new Error(errorData.error || `Failed to delete product: ${response.statusText}`);
  }

  const result: ApiResponse<null> = await response.json();
  console.log('📦 Delete Response data:', result);

  if (!result.success) {
    console.error('❌ Delete API returned success: false:', result);
    throw new Error(result.message || 'Failed to delete product');
  }

  console.log('✅ Product deleted successfully');
}

export async function bulkUpdateProducts(
  ids: string[],
  updates: Partial<ProductFormData>
): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/bulk`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, updates }),
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk update products: ${response.statusText}`);
  }

  const result: ApiResponse<Product[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to bulk update products');
  }

  return result.data;
}

export async function bulkDeleteProducts(
  ids: string[],
  deleteType: 'soft' | 'hard' = 'soft'
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/bulk`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, deleteType }),
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk delete products: ${response.statusText}`);
  }

  const result: ApiResponse<null> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to bulk delete products');
  }
}
