// hooks/usePlanForm.ts
import { useState, useCallback } from 'react';
import type { MembershipPlanFormData } from '@/types/membership';

// Расширенная версия формы с isActive и правильной типизацией description
export interface PlanFormData extends Omit<MembershipPlanFormData, 'description'> {
  description: string; // Сделаем обязательным для формы, но пустая строка по умолчанию
  isActive: boolean;
}

export const usePlanForm = (initialData?: Partial<PlanFormData>) => {
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    type: "basic",
    duration: 30,
    price: 0,
    description: "", // Всегда строка, даже если пустая
    features: [],
    isActive: true,
    ...initialData
  });

  const [featureInput, setFeatureInput] = useState("");

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      type: "basic",
      duration: 30,
      price: 0,
      description: "", // Всегда строка
      features: [],
      isActive: true
    });
    setFeatureInput("");
  }, []);

  const updateField = useCallback(<K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const addFeature = useCallback(() => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  }, [featureInput]);

  const removeFeature = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  }, []);

  const isValid = formData.name && formData.price && formData.duration;

  return {
    formData,
    featureInput,
    setFeatureInput,
    resetForm,
    updateField,
    addFeature,
    removeFeature,
    isValid,
    setFormData
  };
};