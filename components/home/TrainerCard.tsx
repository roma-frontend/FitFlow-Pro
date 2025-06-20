"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award } from "lucide-react";

interface TrainerCardProps {
  trainer: {
    name: string;
    specialty: string;
    rating: string;
    experience: string;
    price: string;
    icon: any;
    gradient: string;
    hoverGradient: string;
    textColor: string;
    iconColor: string;
    badgeColor: string;
    description: string;
    badges: string[];
    link: string;
    bookingLink: string;
  };
}

const TrainerCard = memo(({ trainer }: TrainerCardProps) => {
  const router = useRouter();
  const IconComponent = trainer.icon;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(trainer.link);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(trainer.bookingLink);
  };

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
      onClick={handleBookingClick}
    >
      <div className="relative overflow-hidden">
        <div
          className={`h-64 bg-gradient-to-br ${trainer.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
        >
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
              <IconComponent className="h-12 w-12 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <h3 className="text-xl font-bold transition-all duration-300 group-hover:scale-105">
              {trainer.name}
            </h3>
            <p
              className={`${trainer.textColor} transition-opacity duration-300 group-hover:opacity-90`}
            >
              {trainer.specialty}
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4 transition-all duration-300 group-hover:scale-110">
          <div className="flex items-center bg-white/90 rounded-full px-2 py-1 backdrop-blur-sm">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{trainer.rating}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award
              className={`h-4 w-4 ${trainer.iconColor} transition-colors duration-300`}
            />
            <span>{trainer.experience}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {trainer.badges.map((badge: string, index: number) => (
              <Badge
                key={index}
                className={`${trainer.badgeColor} transition-all duration-300 hover:scale-105`}
              >
                {badge}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
            {trainer.description}
          </p>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 gap-2 md:gap-0">
            <div className="text-lg font-bold text-gray-900 transition-all duration-300 group-hover:scale-105">
              {trainer.price}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleProfileClick}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Профиль
              </button>
              <button
                onClick={handleBookingClick}
                className={`px-3 py-1 text-sm bg-gradient-to-r ${trainer.gradient} text-white rounded ${trainer.hoverGradient} transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
              >
                Записаться
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TrainerCard.displayName = "TrainerCard";

export default TrainerCard;
