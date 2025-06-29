// components/admin/products/BulkActions.tsx
import React, { memo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trash2, 
  Archive, 
  Star, 
  Package, 
  CheckSquare,
  Square
} from "lucide-react";

interface BulkActionsProps {
  selectedProducts: string[];
  totalProducts: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: (productIds: string[]) => void;
  onBulkArchive: (productIds: string[]) => void;
  onBulkMarkPopular: (productIds: string[]) => void;
  onBulkUpdateCategory: (productIds: string[], category: string) => void;
}

export const BulkActions = memo(function BulkActions({
  selectedProducts,
  totalProducts,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkArchive,
  onBulkMarkPopular,
  onBulkUpdateCategory
}: BulkActionsProps) {
  const [bulkCategory, setBulkCategory] = useState<string>('');

  if (selectedProducts.length === 0) return null;

  const isAllSelected = selectedProducts.length === totalProducts;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2"
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {isAllSelected ? 'Снять выделение' : 'Выбрать все'}
          </Button>
          
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Выбрано: {selectedProducts.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkMarkPopular(selectedProducts)}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Популярные
          </Button>

          <Select value={bulkCategory} onValueChange={setBulkCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supplements">Добавки</SelectItem>
              <SelectItem value="drinks">Напитки</SelectItem>
              <SelectItem value="snacks">Снеки</SelectItem>
              <SelectItem value="merchandise">Мерч</SelectItem>
            </SelectContent>
          </Select>

          {bulkCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onBulkUpdateCategory(selectedProducts, bulkCategory);
                setBulkCategory('');
              }}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Применить
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkArchive(selectedProducts)}
            className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700"
          >
            <Archive className="h-4 w-4" />
            Архивировать
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onBulkDelete(selectedProducts)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>
    </div>
  );
});
