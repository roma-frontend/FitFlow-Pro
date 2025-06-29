// components/book-trainer/cards/TrainerCard.tsx
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrainerImage } from "./TrainerImage";
import { TrainerRating } from "./TrainerRating";
import { TrainerSpecializations } from "./TrainerSpecializations";
import { TrainerExperience } from "./TrainerExperience";
import { Trainer } from "../types";
import { TrainerLanguages } from "./TrainerLanguages";

interface TrainerCardProps {
  trainer: Trainer;
  onSelect: () => void;
}

export const TrainerCard = memo(function TrainerCard({ trainer, onSelect }: TrainerCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <TrainerImage
        photoUrl={trainer.photoUrl}
        name={trainer.name}
        hourlyRate={trainer.hourlyRate}
        rating={trainer.rating}
      />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg mb-1">{trainer.name}</h3>
            <TrainerRating
              rating={trainer.rating}
              totalReviews={trainer.totalReviews}
            />
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <TrainerExperience experience={trainer.experience} />
          {trainer.languages && (
            <TrainerLanguages languages={trainer.languages} />
          )}
        </div>

        <TrainerSpecializations specializations={trainer.specializations} />

        {trainer.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {trainer.bio}
          </p>
        )}

        <Button
          onClick={onSelect}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Записаться
        </Button>
      </CardContent>
    </Card>
  );
});
