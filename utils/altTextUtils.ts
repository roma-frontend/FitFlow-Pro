import { CartItem } from '@/stores/cartStore';
import { formatProductPrice } from '@/hooks/useShopProducts';

// Генерирует описательный alt текст для изображения продукта
export const generateProductImageAlt = (product: {
  name: string;
  price: number;
  category?: string;
  isPopular?: boolean;
  inStock?: number;
}): string => {
  const price = formatProductPrice(product.price);
  
  const parts = [
    product.name,
    `цена ${price}`
  ];
  
  if (product.isPopular) {
    parts.push('популярный товар');
  }
  
  if (product.category) {
    parts.push(`категория: ${product.category}`);
  }
  
  if (product.inStock !== undefined) {
    parts.push(`остаток: ${product.inStock} шт.`);
  }
  
  return parts.join(', ');
};

// Генерирует alt текст для изображения в корзине
export const generateCartImageAlt = (item: CartItem): string => {
  return `${item.name} в корзине, цена ${formatProductPrice(item.price)}, количество ${item.quantity}`;
};

// Генерирует fallback текст для изображений
export const generateFallbackText = (productName: string): string => {
  return `Изображение товара ${productName}`;
};

// Проверяет и очищает alt текст
export const sanitizeAltText = (alt: string): string => {
  if (!alt || alt.trim() === '') {
    return 'Изображение товара';
  }
  
  // Удаляем лишние пробелы и ограничиваем длину
  return alt.trim().substring(0, 200);
};
