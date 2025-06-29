// hooks/useProductDialogs.ts
import { Product } from '@/types/product';
import { useState } from 'react';

interface DeleteDialogState {
  open: boolean;
  productId: string;
  productName: string;
  deleteType: 'soft' | 'hard';
}

export function useProductDialogs() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    productId: '',
    productName: '',
    deleteType: 'soft'
  });

  const openDeleteDialog = (productId: string, productName: string, deleteType: 'soft' | 'hard' = 'soft') => {
    setDeleteDialog({
      open: true,
      productId,
      productName,
      deleteType
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      productId: '',
      productName: '',
      deleteType: 'soft'
    });
  };

  return {
    showCreateForm,
    setShowCreateForm,
    editingProduct,
    setEditingProduct,
    deleteDialog,
    openDeleteDialog,
    closeDeleteDialog
  };
}
