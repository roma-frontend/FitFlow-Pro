// components/book-trainer/cards/TrainerRating.tsx
import { Star } from "lucide-react";

interface TrainerRatingProps {
  rating?: number;
  totalReviews?: number;
}

export function TrainerRating({ rating, totalReviews }: TrainerRatingProps) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <span className="text-sm">{rating || 0}</span>
      <span className="text-xs text-gray-500">
        ({totalReviews || 0} отзывов)
      </span>
    </div>
  );
}
