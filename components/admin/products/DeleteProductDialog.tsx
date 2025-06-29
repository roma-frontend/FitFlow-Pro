// components/admin/products/DeleteProductDialog.tsx
"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useProducts';
import { Loader2, AlertTriangle, Trash2, Archive } from 'lucide-react';

interface DeleteProductDialogProps {
  productId: string;
  productName: string;
  deleteType?: 'soft' | 'hard';
  onClose: () => void;
}

export function DeleteProductDialog({
  productId,
  productName,
  deleteType: initialDeleteType = 'soft',
  onClose
}: DeleteProductDialogProps) {
  const { deleteProduct, isDeleting } = useProducts();
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>(initialDeleteType);

  const handleDelete = async () => {
    try {
      await deleteProduct(productId, deleteType);
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Удалить продукт
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Вы действительно хотите удалить продукт{' '}
                <span className="font-semibold">"{productName}"</span>?
              </p>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Тип удаления:</Label>
                <RadioGroup
                  value={deleteType}
                  onValueChange={(value: 'soft' | 'hard') => setDeleteType(value)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="soft" id="soft" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="soft" className="flex items-center gap-2 font-medium">
                        <Archive className="h-4 w-4 text-orange-600" />
                        Архивировать
                      </Label>
                      <p className="text-xs text-gray-600">
                        Продукт будет скрыт от покупателей, но данные сохранятся.
                        Можно будет восстановить позже.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg border-red-200 bg-red-50">
                    <RadioGroupItem value="hard" id="hard" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="hard" className="flex items-center gap-2 font-medium text-red-700">
                        <Trash2 className="h-4 w-4 text-red-600" />
                        Удалить навсегда
                      </Label>
                      <p className="text-xs text-red-600">
                        Продукт будет удален безвозвратно. Это действие нельзя отменить.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={deleteType === 'hard' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {deleteType === 'soft' ? 'Архивировать' : 'Удалить навсегда'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
