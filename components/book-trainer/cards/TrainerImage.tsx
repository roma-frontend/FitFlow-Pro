// components/book-trainer/cards/TrainerImage.tsx
import { Badge } from "@/components/ui/badge";

interface TrainerImageProps {
  photoUrl?: string;
  name: string;
  hourlyRate: number;
  rating?: number;
}

export function TrainerImage({ photoUrl, name, hourlyRate, rating }: TrainerImageProps) {
  return (
    <div className="relative">
      <img
        src={photoUrl || "/placeholder-trainer.jpg"}
        alt={name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <div className="absolute top-3 right-3">
        <Badge className="bg-white/90 text-gray-900">
          {hourlyRate} ₽/час
        </Badge>
      </div>
      {rating && rating >= 4.8 && (
        <div className="absolute top-3 left-3">
          <Badge className="bg-yellow-500">⭐ Топ тренер</Badge>
        </div>
      )}
    </div>
  );
}
