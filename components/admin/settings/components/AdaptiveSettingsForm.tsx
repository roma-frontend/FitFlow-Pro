// components/admin/settings/components/AdaptiveSettingsForm.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAdaptiveSettings } from '@/hooks/useAdaptiveSettings';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'switch' | 'select' | 'number';
  value: any;
  options?: { value: string; label: string; }[];
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

interface AdaptiveSettingsFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  onFieldChange: (fieldId: string, value: any) => void;
  onSave?: () => void;
  onReset?: () => void;
  hasUnsavedChanges?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const AdaptiveSettingsForm = ({
  title,
  description,
  fields,
  onFieldChange,
  onSave,
  onReset,
  hasUnsavedChanges = false,
  isLoading = false,
  className
}: AdaptiveSettingsFormProps) => {
  const { isMobile, isTablet } = useAdaptiveSettings();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    onFieldChange(fieldId, value);
  }, [onFieldChange]);

  const renderField = (field: FormField) => {
    const isRequired = field.required;
    const isDisabled = field.disabled || isLoading;
    const isFocused = focusedField === field.id;

    const fieldClasses = cn(
      "transition-all duration-200",
      isFocused && "ring-2 ring-blue-500/20",
      isDisabled && "opacity-50 cursor-not-allowed"
    );

    const labelClasses = cn(
      "font-medium text-gray-700",
      isMobile ? "text-sm" : "text-base",
      isRequired && "after:content-['*'] after:text-red-500 after:ml-1"
    );

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={labelClasses}>
              {field.label}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={field.value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
              placeholder={field.placeholder}
              disabled={isDisabled}
              className={cn(
                fieldClasses,
                isMobile ? "h-10" : "h-11"
              )}
            />
            {field.description && (
              <p className={cn(
                "text-gray-500",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {field.description}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={labelClasses}>
              {field.label}
            </Label>
            <Textarea
              id={field.id}
              value={field.value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
              placeholder={field.placeholder}
              disabled={isDisabled}
              className={cn(
                fieldClasses,
                isMobile ? "min-h-[80px]" : "min-h-[100px]"
              )}
            />
            {field.description && (
              <p className={cn(
                "text-gray-500",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {field.description}
              </p>
            )}
          </div>
        );

      case 'switch':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor={field.id} className={labelClasses}>
                  {field.label}
                </Label>
                {field.description && (
                  <p className={cn(
                    "text-gray-500",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {field.description}
                  </p>
                )}
              </div>
              <Switch
                id={field.id}
                checked={field.value || false}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                disabled={isDisabled}
                className={fieldClasses}
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className={labelClasses}>
              {field.label}
            </Label>
            <Select
              value={field.value || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              disabled={isDisabled}
            >
              <SelectTrigger 
                className={cn(
                  fieldClasses,
                  isMobile ? "h-10" : "h-11"
                )}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
              >
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className={cn(
                "text-gray-500",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {field.description}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={cn(
        isMobile ? "p-4 pb-3" : "p-6 pb-4"
      )}>
        <CardTitle className={cn(
          "text-gray-900",
          isMobile ? "text-lg" : "text-xl"
        )}>
          {title}
        </CardTitle>
        {description && (
          <p className={cn(
            "text-gray-600 mt-1",
            isMobile ? "text-sm" : "text-base"
          )}>
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn(
        "space-y-4",
        isMobile ? "p-4 pt-0" : "p-6 pt-0"
      )}>
        {/* Поля формы */}
        <div className={cn(
          "space-y-4",
          !isMobile && "space-y-6"
        )}>
          {fields.map(renderField)}
        </div>

        {/* Кнопки действий */}
        {(onSave || onReset) && (
          <div className={cn(
            "flex gap-3 pt-4 border-t border-gray-200",
            isMobile ? "flex-col" : "flex-row justify-end"
          )}>
            {onReset && (
              <Button
                variant="outline"
                onClick={onReset}
                disabled={isLoading}
                className={cn(
                  isMobile ? "w-full" : "w-auto"
                )}
              >
                Сбросить
              </Button>
            )}
            {onSave && (
              <Button
                onClick={onSave}
                disabled={!hasUnsavedChanges || isLoading}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700",
                  isMobile ? "w-full" : "w-auto"
                )}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
