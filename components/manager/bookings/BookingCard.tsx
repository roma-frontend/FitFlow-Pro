// components/manager/bookings/BookingCard.tsx
import { memo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
    CheckCircle,
} from "lucide-react";
import { getBookingStatusColor, getBookingStatusIcon, getBookingStatusText, getTypeColor, getTypeText } from "@/utils/bookingHelpers";

interface BookingCardProps {
    booking: any;
    onStatusChange: (booking: any) => void;
}

const BookingCard = memo(({ booking, onStatusChange }: BookingCardProps) => {
    const router = useRouter();
    const StatusIcon = getBookingStatusIcon(booking.status);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                {/* Заголовок карточки */}
                <div className="flex items-center justify-between mb-3">
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
                            <div className="font-semibold text-gray-900">
                                {booking.clientName || "Неизвестный клиент"}
                            </div>
                            <div className="text-sm text-gray-500">
                                {booking.clientPhone || "Телефон не указан"}
                            </div>
                        </div>
                    </div>

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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Информация о тренере */}
                <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={booking.trainerAvatar} />
                        <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                            {booking.trainerName
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                        {booking.trainerName || "Неизвестный тренер"}
                    </span>
                </div>

                {/* Детали записи */}
                <BookingDetails booking={booking} />

                {/* Статусы и тип */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                        <Badge className={getTypeColor(booking.type)}>
                            {getTypeText(booking.type)}
                        </Badge>
                        <Badge className={getBookingStatusColor(booking.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getBookingStatusText(booking.status)}
                        </Badge>
                    </div>
                </div>

                {/* Заметки */}
                {booking.notes && (
                    <div className="p-2 bg-blue-50 rounded text-sm text-blue-800 mb-3">
                        <span className="font-medium">Заметки: </span>
                        {booking.notes}
                    </div>
                )}

                {/* Действия */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/manager/bookings/${booking.id}`)}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Просмотр
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onStatusChange(booking)}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Статус
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
});

BookingCard.displayName = "BookingCard";

// Компонент для деталей записи
const BookingDetails = memo(({ booking }: { booking: any }) => (
    <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Дата и время:</span>
            <span className="font-medium">
                {booking.date ? new Date(booking.date).toLocaleDateString("ru-RU") : "Дата не указана"}
                {booking.time && ` в ${booking.time}`}
            </span>
        </div>

        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Услуга:</span>
            <span className="font-medium">{booking.service || "Услуга не указана"}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Длительность:</span>
            <span className="font-medium">
                {booking.duration ? `${booking.duration} минут` : "Не указана"}
            </span>
        </div>

        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Цена:</span>
            <span className="font-semibold text-gray-900">
                {booking.price ? `${booking.price.toLocaleString()} ₽` : "Не указана"}
            </span>
        </div>
    </div>
));
BookingDetails.displayName = "BookingDetails";

export default BookingCard;