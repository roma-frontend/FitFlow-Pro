// components/FeaturesList.tsx
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Plus, X } from "lucide-react";

interface FeaturesListProps {
  features: string[];
  featureInput: string;
  onFeatureInputChange: (value: string) => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
}

export const FeaturesList = memo<FeaturesListProps>(({
  features,
  featureInput,
  onFeatureInputChange,
  onAddFeature,
  onRemoveFeature
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddFeature();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Особенности плана</Label>
      <div className="flex gap-2">
        <Input
          value={featureInput}
          onChange={(e) => onFeatureInputChange(e.target.value)}
          placeholder="Например: Доступ в тренажерный зал"
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          onClick={onAddFeature}
          disabled={!featureInput.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {features.length > 0 && (
        <div className="space-y-2 mt-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="flex-1 text-sm">{feature}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFeature(index)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

FeaturesList.displayName = 'FeaturesList';