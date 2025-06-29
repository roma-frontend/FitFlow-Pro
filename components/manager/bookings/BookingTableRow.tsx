// components/manager/bookings/BookingTableRow.tsx
import { memo } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  CheckCircle,
} from "lucide-react";
import { getBookingStatusColor, getBookingStatusIcon, getBookingStatusText, getTypeColor, getTypeText } from "@/utils/bookingHelpers";

interface BookingTableRowProps {
  booking: any;
  onStatusChange: (booking: any) => void;
}

const BookingTableRow = memo(({ booking, onStatusChange }: BookingTableRowProps) => {
  const router = useRouter();
  const StatusIcon = getBookingStatusIcon(booking.status);

  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={booking.clientAvatar} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {booking.clientName
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">
              {booking.clientName || "Неизвестный клиент"}
            </div>
            <div className="text-sm text-gray-500">
              {booking.clientPhone || "Телефон не указан"}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={booking.trainerAvatar} />
            <AvatarFallback className="bg-green-100 text-green-800">
              {booking.trainerName
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium text-gray-900">
            {booking.trainerName || "Неизвестный тренер"}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {booking.date ? new Date(booking.date).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            }) : "Дата не указана"}
          </div>
          <div className="text-gray-500">
            {booking.time || "Время не указано"} 
            {booking.duration && ` (${booking.duration} мин)`}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {booking.service || "Услуга не указана"}
          </div>
          {booking.notes && (
            <div className="text-gray-500 text-xs mt-1 truncate max-w-32">
              {booking.notes}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge className={getTypeColor(booking.type)}>
          {getTypeText(booking.type)}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge className={getBookingStatusColor(booking.status)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {getBookingStatusText(booking.status)}
        </Badge>
      </TableCell>

      <TableCell>
        <span className="font-semibold text-gray-900">
          {booking.price ? `${booking.price.toLocaleString()} ₽` : "Цена не указана"}
        </span>
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/manager/bookings/${booking.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Просмотр
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/manager/bookings/${booking.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Изменить статус
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

BookingTableRow.displayName = "BookingTableRow";

export default BookingTableRow;
