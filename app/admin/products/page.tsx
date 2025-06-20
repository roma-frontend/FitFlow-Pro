"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { ProductsWithFilters } from '@/components/admin/products/ProductsWithFilters';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { DeleteProductDialog } from '@/components/admin/products/DeleteProductDialog';
import { ProductsHeader } from '@/components/admin/products/ProductsHeader';
import { useProducts } from '@/hooks/useProducts';
import { useRouter } from 'next/navigation';
import type { Product, ProductFormData } from '@/types/product';
import { ProductsPageSkeleton } from '@/components/admin/products/skeletons/ProductsPageSkeleton';

export default function ProductsPage() {
  const { 
    products, 
    isLoading, 
    createProduct, 
    updateProduct, 
    isCreating, 
    isUpdating 
  } = useProducts();
  
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{
    id: string;
    name: string;
    deleteType?: 'soft' | 'hard';
  } | null>(null);

  // Обработчики
  const handleCreateProduct = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = (id: string, name: string, deleteType?: 'soft' | 'hard') => {
    setDeletingProduct({ id, name, deleteType });
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setEditingProduct(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingProduct(null);
  };

  // Функции для работы с продуктами
  const handleCreateSubmit = async (data: ProductFormData) => {
    try {
      await createProduct(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Ошибка создания продукта:', error);
      throw error; // Пробрасываем ошибку для обработки в форме
    }
  };

  const handleUpdateSubmit = async (data: ProductFormData) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(editingProduct._id, data);
      setEditingProduct(null);
    } catch (error) {
      console.error('Ошибка обновления продукта:', error);
      throw error; // Пробрасываем ошибку для обработки в форме
    }
  };

  const handleRefresh = () => {
    // Логика обновления продуктов
    window.location.reload();
  };

  const handleSearch = () => {
    // Логика поиска
    console.log('Открыть поиск');
  };

  const handleFilter = () => {
    // Логика фильтров
    console.log('Открыть фильтры');
  };

  const handleAnalytics = () => {
    // Переход к аналитике продуктов
    router.push('/admin/analytics/products');
  };

  // Статистика для заголовка
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock > 10).length,
    lowStock: products.filter(p => p.inStock > 0 && p.inStock <= 10).length,
    outOfStock: products.filter(p => p.inStock === 0).length,
    popular: products.filter(p => p.isPopular).length,
  };

  if (isLoading && products.length === 0) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <ProductsHeader
        stats={stats}
        isLoading={isLoading}
        onBack={() => router.push('/admin')}
        onCreateProduct={handleCreateProduct}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onRefresh={handleRefresh}
        onAnalytics={handleAnalytics}
      />

      {/* Быстрая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего продуктов</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Загрузка...' : 'активных продуктов'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В наличии</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.inStock / stats.total) * 100) : 0}% от общего
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заканчивается</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              требует пополнения
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нет в наличии</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              недоступно для продажи
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Популярные</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.popular}</div>
            <p className="text-xs text-muted-foreground">
              рекомендуемые товары
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Предупреждения */}
      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <div className="space-y-2">
          {stats.outOfStock > 0 && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Внимание! {stats.outOfStock} товаров нет в наличии
                </p>
                <p className="text-xs text-red-600">
                  Эти товары недоступны для покупки клиентами
                </p>
              </div>
              <Badge variant="destructive">{stats.outOfStock}</Badge>
            </div>
          )}
          
          {stats.lowStock > 0 && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  {stats.lowStock} товаров заканчивается
                </p>
                <p className="text-xs text-yellow-600">
                  Рекомендуется пополнить запасы в ближайшее время
                </p>
              </div>
              <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                {stats.lowStock}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Основной контент с фильтрами */}
      <ProductsWithFilters
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Форма создания продукта */}
      <ProductForm
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />

      {/* Форма редактирования продукта */}
      <ProductForm
        product={editingProduct || undefined}
        isOpen={!!editingProduct}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdateSubmit}
        isLoading={isUpdating}
      />

      {/* Диалог удаления продукта */}
      {deletingProduct && (
        <DeleteProductDialog
          productId={deletingProduct.id}
          productName={deletingProduct.name}
          deleteType={deletingProduct.deleteType}
          onClose={handleCloseDeleteDialog}
        />
      )}
    </div>
  );
}
