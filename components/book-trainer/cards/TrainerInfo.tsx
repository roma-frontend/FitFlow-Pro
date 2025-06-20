// components/book-trainer/cards/TrainerInfo.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrainerRating } from "./TrainerRating";
import { Trainer } from "../types";

interface TrainerInfoProps {
  trainer: Trainer;
}

export function TrainerInfo({ trainer }: TrainerInfoProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={trainer.photoUrl} alt={trainer.name} />
            <AvatarFallback>{trainer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold">{trainer.name}</h3>
            <TrainerRating
              rating={trainer.rating}
              totalReviews={trainer.totalReviews}
            />
            <p className="text-sm text-gray-600">
              {trainer.experience} лет опыта
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Специализации:</h4>
            <div className="flex flex-wrap gap-1">
              {trainer.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {trainer.bio && (
            <div>
              <h4 className="font-medium mb-2">О тренере:</h4>
              <p className="text-sm text-gray-600">{trainer.bio}</p>
            </div>
          )}

          <div className="pt-3 border-t">
            <p className="text-lg font-bold">{trainer.hourlyRate} ₽/час</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
