// components/PlanCard.tsx
import React, { memo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Dumbbell,
  Star,
  Trophy,
  Infinity,
  Package
} from "lucide-react";
import type { MembershipPlan } from '@/hooks/usePlans';

interface PlanCardProps {
  plan: MembershipPlan;
  onEdit: (plan: MembershipPlan) => void;
  onDelete: (plan: MembershipPlan) => void;
  onToggleActive: (plan: MembershipPlan) => void;
}

const planIcons = {
  basic: Dumbbell,
  premium: Star,
  vip: Trophy,
  unlimited: Infinity
};

const planColors = {
  basic: "from-gray-500 to-gray-600",
  premium: "from-blue-500 to-indigo-600",
  vip: "from-purple-500 to-pink-600",
  unlimited: "from-yellow-500 to-orange-600"
};

const durationLabels = {
  30: "Месячный",
  90: "Квартальный",
  180: "Полугодовой",
  365: "Годовой"
};

export const PlanCard = memo<PlanCardProps>(({
  plan,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const Icon = planIcons[plan.type as keyof typeof planIcons] || Package;
  const color = planColors[plan.type as keyof typeof planColors] || "from-gray-500 to-gray-600";
  const durationLabel = durationLabels[plan.duration as keyof typeof durationLabels] || `${plan.duration} дней`;

  return (
    <div className="relative group h-full flex flex-col min-h-[320px]">
      <div className={`absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 z-10 pointer-events-none`} />

      <div className="absolute w-full h-full flex items-center justify-center z-30 gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white hover:bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
                onClick={() => onEdit(plan)}
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-50 text-black text-[11px]">
              Редактировать план
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white hover:bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
                onClick={() => onDelete(plan)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-50 text-black text-[11px]">
              Удалить план
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="absolute top-3 right-3 z-30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${plan.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive(plan);
                }}
              >
                {plan.isActive ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Активен
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Неактивен
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-800 text-white text-sm">
              {plan.isActive
                ? "Кликните для деактивации плана"
                : "Кликните для активации плана"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card className={`relative z-0 flex-1 flex flex-col bg-gradient-to-br ${color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
        <CardHeader className="pb-3 pt-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              {durationLabel}
            </Badge>
          </div>
          {plan.description && (
            <CardDescription className="text-white/80">
              {plan.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <div className="mb-4">
            <div className="text-3xl font-bold">
              {plan.price.toLocaleString()}₽
            </div>
            <div className="text-sm opacity-90">
              {plan.duration === 30 ? 'в месяц' : plan.duration === 365 ? 'в год' : `на ${plan.duration} дней`}
            </div>
          </div>

          <div className="space-y-2">
            {plan.features?.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PlanCard.displayName = 'PlanCard';