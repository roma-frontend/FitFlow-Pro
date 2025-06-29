// components/manager/bookings/BookingEmptyState.tsx (исправленная версия)
import { memo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface BookingEmptyStateProps {
  hasFilters: boolean;
  searchTerm: string;
  statusFilter: string;
  trainerFilter: string;
  dateFilter: string;
}

const BookingEmptyState = memo(({
  hasFilters,
  searchTerm,
  statusFilter,
  trainerFilter,
  dateFilter,
}: BookingEmptyStateProps) => {
  const router = useRouter();

  // Правильная проверка активных фильтров
  const hasActiveFilters = Boolean(
    searchTerm ||
    (statusFilter && statusFilter !== "all") ||
    (trainerFilter && trainerFilter !== "all") ||
    (dateFilter && dateFilter !== "today")
  );

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Записи не найдены
        </h3>
        <p className="text-gray-600 mb-6">
          {hasActiveFilters
            ? "Попробуйте изменить критерии поиска или фильтры"
            : "На сегодня записей нет"}
        </p>
        {!hasActiveFilters && (
          <Button
            onClick={() => router.push("/manager/bookings/create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Создать запись
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

BookingEmptyState.displayName = "BookingEmptyState";

export default BookingEmptyState;
