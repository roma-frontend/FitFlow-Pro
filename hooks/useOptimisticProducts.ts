// hooks/useOptimisticProducts.ts
"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConfirmToast } from '@/components/ui/confirm-toast';
import { Product } from '@/types/product';
import { RotateCcw, Trash2 } from 'lucide-react';

export function useOptimisticProducts(initialProducts: Product[]) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const { showConfirmToast } = useConfirmToast();

  // Обновляем продукты когда изменяются начальные данные
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleRestore = async (id: string, name: string) => {
    // Показываем красивое подтверждение через toast
    showConfirmToast({
      title: "Восстановить продукт?",
      description: `Продукт "${name}" снова появится в каталоге и будет доступен для покупки.`,
      confirmText: "Восстановить",
      cancelText: "Отмена",
      variant: "success",
      icon: React.createElement(RotateCcw, { className: "h-5 w-5" }),
      onConfirm: async () => {
        await performRestore(id, name);
      },
      onCancel: () => {
        console.log("❌ Восстановление отменено пользователем");
      }
    });
  };

  const performRestore = async (id: string, name: string) => {
    setIsPending(true);

    // Оптимистично убираем из списка
    const originalProduct = products.find(p => p._id === id);
    setProducts(prev => prev.filter(product => product._id !== id));

    // Показываем loading toast
    toast({
      title: "Восстановление продукта...",
      description: "Изменения применяются, пожалуйста подождите",
    });

    try {
      const response = await fetch(`/api/products/${id}/restore`, {
        method: 'POST'
      });
      
      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Продукт восстановлен!",
          description: `${name} снова доступен в каталоге`,
          variant: "default",
        });
      } else {
        // Возвращаем продукт обратно в случае ошибки
        if (originalProduct) {
          setProducts(prev => [...prev, originalProduct]);
        }
        toast({
          title: "❌ Ошибка восстановления",
          description: result.error || "Попробуйте еще раз",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Возвращаем продукт обратно в случае ошибки
      if (originalProduct) {
        setProducts(prev => [...prev, originalProduct]);
      }
      console.error("Ошибка восстановления:", error);
      toast({
        title: "❌ Ошибка восстановления продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string, name: string, deleteType: 'soft' | 'hard' = 'hard') => {
    // Показываем красивое подтверждение через toast
    showConfirmToast({
      title: "Удалить навсегда?",
      description: `Вы уверены, что хотите навсегда удалить "${name}"? Это действие нельзя отменить!`,
      confirmText: "Удалить навсегда",
      cancelText: "Отмена",
      variant: "destructive",
      icon: React.createElement(Trash2, { className: "h-5 w-5" }),
      onConfirm: async () => {
        await performDelete(id, name, deleteType);
      },
      onCancel: () => {
        console.log("❌ Удаление отменено пользователем");
      }
    });
  };

  const performDelete = async (id: string, name: string, deleteType: 'soft' | 'hard') => {
    setIsPending(true);

    toast({
      title: "Удаление продукта...",
      description: "Изменения применяются, пожалуйста подождите",
    });

    try {
      const response = await fetch(`/api/products/${id}?type=${deleteType}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();

      if (result.success) {
        // Убираем продукт из списка
        setProducts(prev => prev.filter(product => product._id !== id));
        
        toast({
          title: "✅ Продукт удален навсегда",
          description: `${name} полностью удален из базы данных`,
          variant: "default",
        });
      } else {
        toast({
          title: "❌ Ошибка удаления продукта",
          description: result.error || "Попробуйте еще раз",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast({
        title: "❌ Ошибка удаления продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    products,
    isPending,
    handleRestore,
    handleDelete
  };
}
