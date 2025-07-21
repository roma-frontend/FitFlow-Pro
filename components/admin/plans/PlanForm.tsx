// components/PlanForm.tsx
import React, { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PlanFormData } from '@/hooks/usePlanForm';
import { FeaturesList } from './FeasturesList';

interface PlanFormProps {
  formData: PlanFormData;
  featureInput: string;
  onFieldChange: <K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => void;
  onFeatureInputChange: (value: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
}

export const PlanForm = memo<PlanFormProps>(({
  formData,
  featureInput,
  onFieldChange,
  onFeatureInputChange,
  onAddFeature,
  onRemoveFeature
}) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder="Например: Премиум"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Тип *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => onFieldChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Базовый</SelectItem>
              <SelectItem value="premium">Премиум</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="unlimited">Безлимит</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Длительность (дней) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => onFieldChange('duration', parseInt(e.target.value) || 0)}
            placeholder="30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Цена (₽) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => onFieldChange('price', parseInt(e.target.value) || 0)}
            placeholder="2990"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Идеально для начинающих"
          rows={3}
        />
      </div>

      <FeaturesList
        features={formData.features}
        featureInput={featureInput}
        onFeatureInputChange={onFeatureInputChange}
        onAddFeature={onAddFeature}
        onRemoveFeature={onRemoveFeature}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => onFieldChange('isActive', !!checked)}
        />
        <Label htmlFor="isActive" className="mb-0">
          План активен
        </Label>
      </div>
    </div>
  );
});

PlanForm.displayName = 'PlanForm';
