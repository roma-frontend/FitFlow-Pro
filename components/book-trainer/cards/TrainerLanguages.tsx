// components/book-trainer/cards/TrainerLanguages.tsx
import { Languages } from "lucide-react";

interface TrainerLanguagesProps {
  languages: string[];
}

export function TrainerLanguages({ languages }: TrainerLanguagesProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Languages className="h-4 w-4" />
      <span>{languages.join(", ")}</span>
    </div>
  );
}
