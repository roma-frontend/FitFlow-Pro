"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import { stats } from "./constants/STATS";

interface StatCardProps {
  icon: React.ComponentType<any>;
  value: string;
  label: string;
  gradient: string;
  iconColor: string;
}

function StatCard({ icon: Icon, value, label, gradient, iconColor }: StatCardProps) {
  return (
    <Card className={combineAnimations(
      "hover:shadow-lg border-2 rounded-2xl",
      ANIMATION_CLASSES.transition.all,
      ANIMATION_CLASSES.hover.translateY
    )}>
      <CardContent className="p-6 text-center">
        <div className={combineAnimations(
          `w-16 h-16 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mx-auto mb-4`,
          ANIMATION_CLASSES.transition.transform,
          ANIMATION_CLASSES.hover.scale
        )}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
        <div className="text-gray-600">{label}</div>
      </CardContent>
    </Card>
  );
}

export default function StatsSection() {
  

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          📊 Наши достижения
        </h2>
        <p className="text-xl text-gray-600">
          Цифры, которые говорят о нашем качестве
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
