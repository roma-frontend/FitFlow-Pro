// components/book-trainer/ui/EmptyState.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  onReset?: () => void;
}

export function EmptyState({ title, description, onReset }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          Сбросить фильтры
        </Button>
      )}
    </Card>
  );
}
