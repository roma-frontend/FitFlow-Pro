// components/group-classes/EmptyState.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";

interface EmptyStateProps {
  onSelectToday: () => void;
}

export const EmptyState = ({ onSelectToday }: EmptyStateProps) => {
  return (
    <Card className="p-12 text-center">
      <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Нет занятий
      </h3>
      <p className="text-gray-600 mb-4">
        На выбранную дату занятий не запланировано
      </p>
      <Button variant="outline" onClick={onSelectToday}>
        Выбрать сегодня
      </Button>
    </Card>
  );
};
