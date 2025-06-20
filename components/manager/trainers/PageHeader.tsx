// components/manager/trainers/PageHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  onAddTrainer: () => void;
  onImport: () => void;
}

export default function PageHeader({ onAddTrainer, onImport }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Управление тренерами
        </h1>
        <p className="text-gray-600">
          Управляйте командой тренеров, их статусами и расписанием
        </p>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <Button variant="outline" onClick={onImport}>
          Импорт
        </Button>

        <Button
          onClick={onAddTrainer}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Добавить тренера
        </Button>
      </div>
    </div>
  );
}
