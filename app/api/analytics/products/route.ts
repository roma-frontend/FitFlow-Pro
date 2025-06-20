// app/api/analytics/products/route.ts
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Получаем все продукты из Convex
    const products = await fetchQuery(api.products.getAllIncludingDeleted) || [];
    
    // Фильтруем активные продукты
    const activeProducts = products.filter((p: any) => p.isActive !== false);
    
    // Подсчитываем статистику
    const inStock = activeProducts.filter((p: any) => p.inStock > (p.minStock || 10));
    const lowStock = activeProducts.filter((p: any) => 
      p.inStock > 0 && p.inStock <= (p.minStock || 10)
    );
    const outOfStock = activeProducts.filter((p: any) => p.inStock === 0);

    // Группируем по категориям
    const byCategory = activeProducts.reduce((acc: any, product: any) => {
      const category = product.category || 'other';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          inStock: 0,
          totalValue: 0,
          averagePrice: 0
        };
      }
      
      acc[category].count++;
      if (product.inStock > 0) acc[category].inStock++;
      acc[category].totalValue += (product.price || 0) * (product.inStock || 0);
      
      return acc;
    }, {});

    // Вычисляем средние цены
    Object.keys(byCategory).forEach(category => {
      if (byCategory[category].count > 0) {
        const categoryProducts = activeProducts.filter((p: any) => p.category === category);
        const totalPrice = categoryProducts.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
        byCategory[category].averagePrice = Math.round(totalPrice / categoryProducts.length);
      }
    });

    // Общая стоимость товаров
    const totalValue = activeProducts.reduce((sum: number, product: any) => 
      sum + ((product.price || 0) * (product.inStock || 0)), 0
    );

    // Товары с низким запасом
    const lowStockProducts = lowStock.slice(0, 10).map((product: any) => ({
      id: product._id,
      name: product.name,
      currentStock: product.inStock,
      minStock: product.minStock || 10,
      category: product.category
    }));

    const data = {
      total: products.length,
      active: activeProducts.length,
      inStock: inStock.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue: Math.round(totalValue),
      byCategory,
      lowStockProducts
    };

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}