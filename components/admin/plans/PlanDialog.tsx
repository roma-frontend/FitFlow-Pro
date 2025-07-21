// components/PlanDialog.tsx
import React, { memo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save } from "lucide-react";
import { PlanForm } from './PlanForm';
import type { PlanFormData } from '@/hooks/usePlanForm';

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  mode: 'create' | 'edit';
  loading: boolean;
  formData: PlanFormData;
  featureInput: string;
  onFieldChange: <K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => void;
  onFeatureInputChange: (value: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const PlanDialog = memo<PlanDialogProps>(({
  open,
  onOpenChange,
  title,
  description,
  mode,
  loading,
  formData,
  featureInput,
  onFieldChange,
  onFeatureInputChange,
  onAddFeature,
  onRemoveFeature,
  onSubmit,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <PlanForm
          formData={formData}
          featureInput={featureInput}
          onFieldChange={onFieldChange}
          onFeatureInputChange={onFeatureInputChange}
          onAddFeature={onAddFeature}
          onRemoveFeature={onRemoveFeature}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Создание...' : 'Сохранение...'}
              </>
            ) : (
              <>
                {mode === 'create' ? (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать план
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить изменения
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

PlanDialog.displayName = 'PlanDialog';

// Default export wrapper for lazy loading
export default PlanDialog;