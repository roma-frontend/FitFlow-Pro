"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useProductCount() {
  console.log('🔍 useProductCount: Проверяем количество продуктов');
  
  let result;
  try {
    result = useQuery(api.products.getCount, {});
    console.log('🔍 useProductCount: Результат:', result);
  } catch (error) {
    console.error('❌ useProductCount: Ошибка:', error);
    result = null;
  }

  return result;
}
