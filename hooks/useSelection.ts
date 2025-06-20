// hooks/useSelection.ts
import { useState, useCallback, useMemo } from 'react';

export function useSelection<T extends { _id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedItems = useMemo(() => 
    items.filter(item => selectedIds.has(item._id)), 
    [items, selectedIds]
  );

  const isSelected = useCallback((id: string) => 
    selectedIds.has(id), 
    [selectedIds]
  );

  const isAllSelected = useMemo(() => 
    items.length > 0 && items.every(item => selectedIds.has(item._id)), 
    [items, selectedIds]
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item._id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      ids.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  const deselectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      ids.forEach(id => newSet.delete(id));
      return newSet;
    });
  }, []);

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    isSelected,
    isAllSelected,
    toggle,
    selectAll,
    deselectAll,
    selectMultiple,
    deselectMultiple,
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0
  };
}
