"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ProgramCardProps {
  program: {
    title: string;
    description: string;
    duration: string;
    icon: any;
    bgGradient: string;
    borderColor: string;
    iconGradient: string;
    buttonGradient: string;
    buttonHover: string;
    link: string;
  };
}

const ProgramCard = memo(({ program }: ProgramCardProps) => {
  const router = useRouter();
  const IconComponent = program.icon;

  const handleCardClick = () => {
    router.push(program.link);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(program.link);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const bookingLink = `${program.link}?action=book`;
    router.push(bookingLink);
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${program.bgGradient} ${program.borderColor} cursor-pointer`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6 text-center">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${program.iconGradient} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <IconComponent className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h3 className="text-lg font-semibold mb-2 transition-all duration-300 group-hover:scale-105">
          {program.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 transition-colors duration-300 group-hover:text-gray-700">
          {program.description}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4" />
          <span>{program.duration}</span>
        </div>

        <div className="flex flex-col xl:flex-row gap-2">
          <button
            onClick={handleDetailsClick}
            className={`flex-1 bg-gradient-to-r ${program.buttonGradient} text-white py-2 px-3 rounded text-sm ${program.buttonHover} transition-all duration-300 transform hover:scale-105 hover:shadow-md`}
          >
            Подробнее
          </button>
          <button
            onClick={handleBookClick}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
          >
            Записаться
          </button>
        </div>
      </CardContent>
    </Card>
  );
});

ProgramCard.displayName = "ProgramCard";

export default ProgramCard;
