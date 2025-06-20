"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import TrainerCard from "./TrainerCard";
import { TRAINERS_DATA } from "@/constants/homeData";

export default function TrainersSection() {
  const router = useRouter();

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          💪 Наши профессиональные тренеры
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Опытные специалисты помогут вам достичь ваших фитнес-целей
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-2xl p-6 max-w-3xl mx-auto">
          <p className="text-blue-800 text-lg font-medium">
            💡 <strong>Совет:</strong> Нажмите на карточку тренера, чтобы
            узнать больше, или сразу нажмите "Записаться" для быстрого
            бронирования!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TRAINERS_DATA.map((trainer) => (
          <TrainerCard key={trainer.name} trainer={trainer} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Button
          onClick={() => router.push("/trainers")}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl px-8 py-4"
        >
          Посмотреть всех тренеров
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
