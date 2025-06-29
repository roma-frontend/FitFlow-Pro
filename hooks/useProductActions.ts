// hooks/useProductActions.ts
import { Product, ProductFormData } from '@/types/product';
import { useState } from 'react';

interface UseProductActionsProps {
  createProduct: (data: ProductFormData) => Promise<boolean>;
  updateProduct: (id: string, data: ProductFormData) => Promise<boolean>;
  deleteProduct: (id: string, deleteType: 'soft' | 'hard') => Promise<boolean>;
  refetch?: () => Promise<void>;
  toast: any;
  setShowCreateForm: (show: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  openDeleteDialog: (id: string, name: string, deleteType: 'soft' | 'hard') => void;
  closeDeleteDialog: () => void;
}

export function useProductActions({
  createProduct,
  updateProduct,
  deleteProduct,
  refetch,
  toast,
  setShowCreateForm,
  setEditingProduct,
  openDeleteDialog,
  closeDeleteDialog
}: UseProductActionsProps) {
  const [formLoading, setFormLoading] = useState(false);

  const handleCreateProduct = async (data: ProductFormData) => {
    setFormLoading(true);
    
    toast({
      title: "Создание продукта...",
      description: "Пожалуйста, подождите",
    });

    try {
      const success = await createProduct(data);

      if (success) {
        toast({
          title: "Продукт успешно создан!",
          description: `${data.name} добавлен в каталог`,
          variant: "default",
        });
        setShowCreateForm(false);
        if (refetch) {
          await refetch();
        }
      } else {
        toast({
          title: "Ошибка создания продукта",
          description: "Попробуйте еще раз или обратитесь к администратору",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка создания продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (data: ProductFormData, editingProduct: Product | null) => {
    if (!editingProduct) return;

    setFormLoading(true);
    
    toast({
      title: "Обновление продукта...",
      description: "Пожалуйста, подождите",
    });

    try {
      const success = await updateProduct(editingProduct._id, data);

      if (success) {
        toast({
          title: "Продукт успешно обновлен!",
          description: `${data.name} был изменен`,
          variant: "default",
        });
        setEditingProduct(null);
        if (refetch) {
          await refetch();
        }
      } else {
        toast({
          title: "Ошибка обновления продукта",
          description: "Попробуйте еще раз или обратитесь к администратору",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка обновления продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string, deleteType: 'soft' | 'hard') => {
    closeDeleteDialog();

    toast({
      title: deleteType === 'hard' ? "Удаление продукта..." : "Деактивация продукта...",
      description: "Пожалуйста, подождите",
    });

    try {
      const success = await deleteProduct(id, deleteType);

      if (success) {
        if (deleteType === 'hard') {
          toast({
            title: "Продукт удален навсегда",
            description: `${name} полностью удален из базы данных`,
            variant: "default",
          });
        } else {
          toast({
            title: "Продукт деактивирован",
            description: `${name} скрыт из каталога`,
            variant: "default",
          });
        }

        if (refetch) {
          await refetch();
        }
      } else {
        toast({
          title: "Ошибка удаления продукта",
          description: "Попробуйте еще раз или обратитесь к администратору",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка удаления продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    }
  };

  return {
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    formLoading
  };
}
