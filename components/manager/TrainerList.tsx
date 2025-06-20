// components/manager/TrainerList.tsx
import React from "react";
import { Trainer } from "@/contexts/ManagerContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Users, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface TrainerListProps {
  trainers: Trainer[];
  getTrainerStatusColor: (status: Trainer["status"]) => string;
  getTrainerStatusText: (status: Trainer["status"]) => string;
}

export const TrainerList: React.FC<TrainerListProps> = ({
  trainers,
  getTrainerStatusColor,
  getTrainerStatusText,
}) => {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Активные тренеры
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => router.push("/manager/trainers")}>
          Посмотреть всех
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trainers.slice(0, 5).map((trainer) => (
            <div
              key={trainer.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={trainer.avatar} />
                  <AvatarFallback>
                    {trainer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-gray-900">{trainer.name}</h4>
                  <p className="text-sm text-gray-600">{trainer.specialization.slice(0, 2).join(", ")}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getTrainerStatusColor(trainer.status)}>
                      {getTrainerStatusText(trainer.status)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">{trainer.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{trainer.totalClients} клиентов</p>
                <p className="text-xs text-gray-500">{trainer.completedSessions} тренировок</p>
                {trainer.nextSession && (
                  <p className="text-xs text-blue-600 mt-1">Следующая: {trainer.nextSession.time}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
