// components/manager/StatCardList.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ElementType;
  color: "blue" | "green" | "orange" | "purple";
  description: string;
}

interface StatCardListProps {
  statCards: StatCard[];
}

const colorClasses: Record<string, string> = {
  blue: "text-blue-600 bg-blue-100",
  green: "text-green-600 bg-green-100",
  orange: "text-orange-600 bg-orange-100",
  purple: "text-purple-600 bg-purple-100",
};

export const StatCardList: React.FC<StatCardListProps> = ({ statCards }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {statCards.map((card, index) => {
      const IconComponent = card.icon;
      return (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                <div className="flex items-center gap-1">
                  {card.changeType === "increase" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${card.changeType === "increase" ? "text-green-600" : "text-red-600"}`}>
                    {card.change}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[card.color]}`}>
                <IconComponent className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);
