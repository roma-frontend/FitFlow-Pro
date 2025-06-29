// components/manager/bookings/BookingPageHeader.tsx
import { memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";

interface BookingPageHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

const BookingPageHeader = memo(({ onRefresh, refreshing }: BookingPageHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление записями
        </h1>
        <p className="text-gray-600">
          Просматривайте и управляйте всеми записями клиентов
        </p>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Обновить
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Экспорт
        </Button>

        <Button
          onClick={() => router.push("/manager/bookings/create")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Создать запись
        </Button>
      </div>
    </div>
  );
});

BookingPageHeader.displayName = "BookingPageHeader";

export default BookingPageHeader;
