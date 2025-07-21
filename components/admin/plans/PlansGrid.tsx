// components/PlansGrid.tsx
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { PlanCard } from './PlanCard';
import type { MembershipPlan } from '@/types/membership';

interface PlansGridProps {
  plans: MembershipPlan[];
  onEdit: (plan: MembershipPlan) => void;
  onDelete: (plan: MembershipPlan) => void;
  onToggleActive: (plan: MembershipPlan) => void;
  onCreatePlan: () => void;
}

export const PlansGrid = memo<PlansGridProps>(({
  plans,
  onEdit,
  onDelete,
  onToggleActive,
  onCreatePlan
}) => {
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Нет планов абонементов
          </h3>
          <p className="text-gray-600 mb-6">
            Создайте первый план для начала работы
          </p>
          <Button onClick={onCreatePlan} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            Создать план
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan._id}
          plan={plan}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
});

PlansGrid.displayName = 'PlansGrid';