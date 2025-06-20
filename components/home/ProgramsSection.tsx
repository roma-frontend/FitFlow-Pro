"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ProgramCard from "./ProgramCard";
import { PROGRAMS_DATA } from "@/constants/homeData";

export default function ProgramsSection() {
  const router = useRouter();

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          🏋️ Популярные фитнес-программы
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Выберите программу, которая подходит именно вам
        </p>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-2xl p-6 max-w-3xl mx-auto">
          <p className="text-green-800 text-lg font-medium">
            💡 <strong>Совет:</strong> Нажмите на карточку программы, чтобы
            узнать подробности, расписание и записаться на занятия!
          </p>
        </div>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROGRAMS_DATA.map((program) => (
          <ProgramCard key={program.title} program={program} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Button
          onClick={() => router.push("/programs")}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl px-8 py-4"
        >
          Посмотреть все программы
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

