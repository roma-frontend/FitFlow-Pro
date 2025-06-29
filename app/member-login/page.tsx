// app/member-login/page.tsx
import { Suspense } from "react";
import FitnessLoader from '@/components/ui/FitnessLoader';
import MemberLoginContent from "./MemberLoginContent";

// Компонент загрузки для клиентов
function LoginLoading() {
  return (
    <div className="min-h-[100svh] 
                    bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 
                    md:bg-gradient-to-br md:from-blue-50 md:via-indigo-50 md:to-purple-50 
                    relative overflow-hidden">
      {/* Декоративные элементы - адаптивные цвета */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Мобильные декорации (темно-синие) */}
        <div className="md:hidden">
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-400/20 rounded-full" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-indigo-400/20 rounded-full" />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-purple-400/20 rounded-full" />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-blue-400/20 rounded-full" />

          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-transparent rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-purple-400/30 to-transparent rounded-full" />
        </div>

        {/* Десктопные декорации (светлые) */}
        <div className="hidden md:block">
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-indigo-500/10 rounded-full" />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-purple-500/10 rounded-full" />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-blue-500/10 rounded-full" />

          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-purple-400/20 to-transparent rounded-full" />
        </div>
      </div>

      {/* Центральный лоадер */}
      <div className="relative z-10 flex items-center justify-center min-h-[100svh] p-4">
        <div className="text-center">
          <FitnessLoader
            isMobile={false}
            theme="member"
            size="xl"
            variant="cardio"
            text="Начинаем вход в систему..."
            showProgress={true}
            motivationalTexts={[
              "Подготавливаем форму входа...",
              "Загружаем ваш профиль...",
              "Настраиваем интерфейс...",
              "Проверяем подключение...",
              "Почти готово!"
            ]}
            className="drop-shadow-2xl"
          />

          {/* Дополнительная информация - адаптивные цвета */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm 
                          text-white/70 md:text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/50 md:bg-blue-500 rounded-full animate-pulse" />
                <span>Интерфейс</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/50 md:bg-indigo-500 rounded-full animate-pulse animation-delay-500" />
                <span>Профиль</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/50 md:bg-purple-500 rounded-full animate-pulse animation-delay-1000" />
                <span>Подключение</span>
              </div>
            </div>

            {/* Статус - адаптивные цвета */}
            <div className="text-xs text-white/50 md:text-gray-400 space-y-1">
              <p>FitFlow Pro Member Portal</p>
              <p className="animate-pulse">💪 Вход для участников</p>
              <p className="text-white/40 md:text-gray-300">
                Подготавливаем форму входа...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MemberLoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <MemberLoginContent />
    </Suspense>
  );
}