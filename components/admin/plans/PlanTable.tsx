import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Package,
  Trash2,
  Dumbbell,
  Star,
  Trophy,
  Infinity
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


// Типы
export interface MembershipPlan {
  _id: string;
  name: string;
  type: string;
  duration: number;
  price: number;
  description?: string;
  features: string[];
  isActive: boolean;
  createdAt?: number;
}

export interface PlanTableProps {
  plans: MembershipPlan[];
  onEdit: (plan: MembershipPlan) => void;
  onDelete: (plan: MembershipPlan) => void;
  onToggleActive: (plan: MembershipPlan) => void;
  actionLoading: boolean;
}

// Иконки и цвета
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

export function PlanTable({ plans, onEdit, onDelete, onToggleActive, actionLoading }: PlanTableProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Планы абонементов</CardTitle>
        <CardDescription>
          Всего планов: {plans.length}, активных: {plans.filter(p => p.isActive).length}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>План</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Длительность</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Особенности</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => {
              const Icon = planIcons[plan.type as keyof typeof planIcons] || Package;
              const color = planColors[plan.type as keyof typeof planColors] || "from-gray-500 to-gray-600";
              
              return (
                <TableRow key={plan._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${color} flex items-center justify-center shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        {plan.description && (
                          <div className="text-sm text-gray-500">{plan.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="custom" className="capitalize">
                      {plan.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {plan.duration} дней
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {plan.price.toLocaleString()} ₽
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {plan.features?.length || 0} особенностей
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleActive(plan)}
                      disabled={actionLoading}
                      className={plan.isActive ? "text-green-600" : "text-gray-400"}
                    >
                      {plan.isActive ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Активен
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Неактивен
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(plan)}
                        disabled={actionLoading}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(plan)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}