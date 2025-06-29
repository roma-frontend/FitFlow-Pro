// components/manager/MobileTrainerCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Star,
  DollarSign,
  Clock,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Activity,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Plane
} from "lucide-react";

interface MobileTrainerCardProps {
  trainer: any;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: () => void;
  onSchedule: () => void;
}

export default function MobileTrainerCard({ 
  trainer, 
  onView, 
  onEdit, 
  onStatusChange, 
  onSchedule 
}: MobileTrainerCardProps) {
  const getTrainerStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'vacation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainerStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'busy':
        return Clock;
      case 'inactive':
        return XCircle;
      case 'vacation':
        return Plane;
      default:
        return Clock;
    }
  };

  const StatusIcon = getTrainerStatusIcon(trainer.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={trainer.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-sm font-semibold">
              {trainer.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{trainer.name}</h3>
            <Badge className={`${getTrainerStatusColor(trainer.status)} text-xs`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {trainer.status === 'active' ? 'Активен' : 
               trainer.status === 'busy' ? 'Занят' :
               trainer.status === 'inactive' ? 'Неактивен' : 'В отпуске'}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Специализации */}
      <div className="flex flex-wrap gap-1 mb-3">
        {trainer.specialization.slice(0, 2).map((spec: string, index: number) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {spec}
          </Badge>
        ))}
        {trainer.specialization.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{trainer.specialization.length - 2}
          </Badge>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-gray-50 rounded p-2">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-sm font-semibold">{trainer.rating}</span>
          </div>
          <p className="text-xs text-gray-500">Рейтинг</p>
        </div>
        
        <div className="bg-gray-50 rounded p-2">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-3 w-3 text-blue-500" />
            <span className="text-sm font-semibold">{trainer.totalClients}</span>
          </div>
          <p className="text-xs text-gray-500">Клиентов</p>
        </div>
        
        <div className="bg-gray-50 rounded p-2">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-green-500" />
            <span className="text-sm font-semibold">
              {(trainer.monthlyEarnings / 1000).toFixed(0)}К
            </span>
          </div>
          <p className="text-xs text-gray-500">Доход</p>
        </div>
      </div>

      {/* Контакты */}
      <div className="space-y-1 mb-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span className="truncate">{trainer.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          <span>{trainer.phone}</span>
        </div>
      </div>

      {/* Следующая тренировка */}
      {trainer.nextSession && (
        <div className="p-2 bg-blue-50 rounded mb-3">
          <div className="flex items-center gap-1 text-xs text-blue-800 font-medium">
            <Calendar className="h-3 w-3" />
                        Следующая: {trainer.nextSession.time}
          </div>
          <p className="text-xs text-blue-700 mt-1 truncate">
            {trainer.nextSession.client}
          </p>
        </div>
      )}

      {/* Действия */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={onView}
        >
          <Eye className="h-3 w-3 mr-1" />
          Просмотр
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs"
          onClick={onSchedule}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Расписание
        </Button>
      </div>
    </div>
  );
}

