import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Save, Loader2, X, CheckCircle } from "lucide-react";

export interface PlanFormData {
  name: string;
  type: string;
  duration: number;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface PlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: PlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlanFormData>>;
  featureInput: string;
  setFeatureInput: React.Dispatch<React.SetStateAction<string>>;
  actionLoading: boolean;
  mode: "create" | "edit";
}

export function PlanFormDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  featureInput,
  setFeatureInput,
  actionLoading,
  mode
}: PlanFormDialogProps) {
  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const title = mode === "create" ? "Создать новый план" : "Редактировать план";
  const description = mode === "create" 
    ? "Заполните информацию о новом плане абонемента"
    : "Измените информацию о плане абонемента";
  const submitText = mode === "create" ? "Создать план" : "Сохранить изменения";
  const loadingText = mode === "create" ? "Создание..." : "Сохранение...";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${mode}-name`}>Название *</Label>
              <Input
                id={`${mode}-name`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Например: Премиум"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${mode}-type`}>Тип *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
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
              <Label htmlFor={`${mode}-duration`}>Длительность (дней) *</Label>
              <Input
                id={`${mode}-duration`}
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                placeholder="30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${mode}-price`}>Цена (₽) *</Label>
              <Input
                id={`${mode}-price`}
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                placeholder="2990"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-description`}>Описание</Label>
            <Textarea
              id={`${mode}-description`}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Идеально для начинающих"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Особенности плана</Label>
            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Например: Доступ в тренажерный зал"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <Button
                type="button"
                onClick={addFeature}
                disabled={!featureInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.features.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="flex-1 text-sm">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${mode}-isActive`}
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
            />
            <Label htmlFor={`${mode}-isActive`}>
              {mode === "create" ? "Активировать план сразу после создания" : "План активен"}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={actionLoading}
            className={mode === "edit" ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" : ""}
          >
            {actionLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {loadingText}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {submitText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}