// app/actions/products.ts
"use server";

import { revalidatePath, revalidateTag } from 'next/cache';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function restoreProduct(id: string) {
  try {
    console.log("🔄 Server Action: Восстановление продукта:", id);

    const result = await convex.mutation("products:restore", { id });

    // Обновляем кэш для всех страниц с продуктами
    revalidatePath('/admin/products');
    revalidateTag('products');
    revalidateTag('deleted-products');

    console.log("✅ Server Action: Продукт восстановлен");
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Server Action: Ошибка восстановления:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ошибка восстановления' 
    };
  }
}

export async function deleteProductAction(id: string, deleteType: 'soft' | 'hard' = 'soft') {
  try {
    console.log(`🔄 Server Action: ${deleteType} удаление продукта:`, id);

    if (deleteType === 'hard') {
      await convex.mutation("products:hardDelete", { id });
    } else {
      await convex.mutation("products:softDelete", { id });
    }

    // Обновляем кэш
    revalidatePath('/admin/products');
    revalidateTag('products');
    revalidateTag('deleted-products');

    console.log("✅ Server Action: Продукт удален");
    return { success: true };
  } catch (error) {
    console.error("❌ Server Action: Ошибка удаления:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ошибка удаления' 
    };
  }
}
