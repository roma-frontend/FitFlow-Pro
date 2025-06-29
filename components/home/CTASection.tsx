"use client";

import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  Database, 
  Globe, 
  FileText, 
  Heart 
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AuthStatus } from "@/types/home";

interface CTASectionProps {
  authStatus: AuthStatus | null;
  onDashboardRedirect: () => void;
}

export default function CTASection({ authStatus, onDashboardRedirect }: CTASectionProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center mb-16">
      {authStatus?.authenticated ? (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
            Продолжайте работу
          </h2>
          <p className="text-lg xl:text-xl text-gray-600 mb-8">
            Перейдите в свой дашборд для управления системой
          </p>
          <Button
            onClick={onDashboardRedirect}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-12 py-4 text-lg xl:text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl"
          >
            <TrendingUp className="mr-3 h-6 w-6" />
            Перейти в дашборд
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300 rounded-2xl p-8">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
            Готовы начать?
          </h2>
          <p className="md:text-md lg:text-lg xl:text-xl text-gray-600 mb-8">
            Создайте тестовых пользователей и начните изучение системы
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Button
              onClick={() => router.push("/setup-users")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl px-8 py-4 text-md xl:text-lg"
            >
              <Zap className="h-6 w-6 mr-3" />
              Создать пользователей
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
            <Button
              onClick={() => router.push("/setup-demo-data")}
              variant="outline"
              size="lg"
              className="transition-all duration-300 hover:scale-105 border-2 rounded-2xl px-8 py-4 text-md xl:text-lg"
            >
              <Database className="h-6 w-6 mr-3" />
              Добавить демо-данные
            </Button>
          </div>
          
          {/* Дополнительные ссылки */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => router.push("/demo")}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" />
              Посмотреть демо
            </Button>
            <Button
              onClick={() => router.push("/docs")}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Документация
            </Button>
            <Button
              onClick={() => router.push("/support")}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Heart className="h-4 w-4 mr-2" />
              Поддержка
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

