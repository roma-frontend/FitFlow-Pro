// components/manager/trainers/TrainerCard.tsx (исправленная версия)
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Activity,
  Calendar,
} from "lucide-react";
import { getInitials, safeNumber, safeString } from "@/utils/trainerHelpers";
import { Trainer } from "@/types/trainer";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Импорт подкомпонентов
import TrainerHeader from "./TrainerHeader";
import TrainerSpecializations from "./TrainerSpecializations";
import TrainerContactInfo from "./TrainerContactInfo";
import TrainerStatsGrid from "./TrainerStatsGrid";
import TrainerWorkingHours from "./TrainerWorkingHours";
import TrainerNextSession from "./TrainerNextSession";

interface TrainerCardProps {
  trainer: Trainer;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: () => void;
  onSchedule: () => void;
  onDelete?: () => void;
}

function TrainerCardContent({
  trainer,
  onView,
  onEdit,
  onStatusChange,
  onSchedule,
  onDelete,
}: TrainerCardProps) {
  // Значения по умолчанию для необязательных полей
  const rating = safeNumber(trainer.rating, 0);
  const status = safeString(trainer.status, 'inactive');
  const totalClients = safeNumber(trainer.totalClients, 0);
  const monthlyEarnings = safeNumber(trainer.monthlyEarnings, 0);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Заголовок карточки */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={trainer.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                {getInitials(trainer.name)}
              </AvatarFallback>
            </Avatar>

            <TrainerHeader name={trainer.name} status={status} />
          </div>

          {/* Меню действий */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                Просмотр
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStatusChange}>
                <Activity className="mr-2 h-4 w-4" />
                Изменить статус
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Специализации */}
        <div className="mb-4">
          <TrainerSpecializations specializations={trainer.specialization || []} />
        </div>

        {/* Контактная информация */}
        <div className="mb-4">
          <TrainerContactInfo email={trainer.email} phone={trainer.phone} />
        </div>

        {/* Статистика */}
        <div className="mb-4">
          <TrainerStatsGrid
            rating={rating}
            totalClients={totalClients}
            monthlyEarnings={monthlyEarnings}
          />
        </div>

        {/* Рабочие часы */}
        {trainer.workingHours && (
          <div className="mb-4">
            <TrainerWorkingHours workingHours={trainer.workingHours} />
          </div>
        )}

        {/* Следующая тренировка */}
        {trainer.nextSession && (
          <div className="mb-4">
            <TrainerNextSession nextSession={trainer.nextSession} />
          </div>
        )}

        {/* Действия */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="h-4 w-4 mr-2" />
            Просмотр
          </Button>
          <Button size="sm" className="flex-1" onClick={onSchedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Расписание
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrainerCard(props: TrainerCardProps) {
  return (
    <ErrorBoundary>
      <TrainerCardContent {...props} />
    </ErrorBoundary>
  );
}
