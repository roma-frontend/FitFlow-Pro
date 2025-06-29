// components/member/MiniProgress.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useRouter } from "next/navigation";

interface MiniProgressProps {
  stats: {
    completed: number;
    totalHours: number;
  };
}

export default function MiniProgress({ stats }: MiniProgressProps) {
  const router = useRouter();

  return (
    <Card className="shadow-lg border-l-4 border-l-green-500 border-0">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Краткий прогресс
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Тренировки в месяце</span>
              <span className="text-blue-600 font-bold">
                {stats.completed}/20
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min((stats.completed / 20) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Часы тренировок</span>
              <span className="text-green-600 font-bold">
                {stats.totalHours}/40
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min((stats.totalHours / 40) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/member-dashboard/progress")}
          >
            Подробный прогресс
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
