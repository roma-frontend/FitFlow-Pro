// app/staff-login/page.tsx
import { Suspense } from "react";
import FitnessLoader from "@/components/ui/FitnessLoader";
import StaffLoginContent from "./StaffLoginContent";

// Компонент загрузки для персонала - показывается при первой загрузке страницы
function StaffLoginLoading() {
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 md:bg-gradient-to-br md:from-slate-50 md:via-gray-50 md:to-zinc-50 relative overflow-hidden">
      {/* Декоративные элементы - адаптивные цвета */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Мобильные декорации (фиолетовые) */}
        <div className="md:hidden">
          <div className="absolute top-20 left-10 w-16 h-16 bg-purple-400/20 rounded-full" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-violet-400/20 rounded-full" />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-indigo-400/20 rounded-full" />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-purple-400/20 rounded-full" />

          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-transparent rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-violet-400/30 to-transparent rounded-full" />
        </div>

        {/* Десктопные декорации (светлые) */}
        <div className="hidden md:block">
          <div className="absolute top-20 left-10 w-16 h-16 bg-gray-500/10 rounded-full" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-slate-500/10 rounded-full" />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-zinc-500/10 rounded-full" />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-gray-500/10 rounded-full" />

          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-gray-400/20 to-transparent rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-slate-400/20 to-transparent rounded-full" />
        </div>
      </div>

      {/* Центральный лоадер */}
      <div className="relative z-10 flex items-center justify-center min-h-[100svh] p-4">
        <div className="text-center">
          <FitnessLoader
            isMobile={false}
            theme="staff"
            size="xl"
            variant="strength"
            text="Staff Portal"
            showProgress={true}
            motivationalTexts={[
              "Подготавливаем форму входа для персонала...",
              "Загружаем настройки доступа...",
              "Проверяем права доступа...",
              "Настраиваем рабочую среду...",
              "Инициализируем систему...",
              "Почти готово!"
            ]}
            className="drop-shadow-2xl"
          />

          {/* Дополнительная информация - адаптивные цвета */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-white/70 md:text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/50 md:bg-gray-500 rounded-full animate-pulse" />
                <span>Доступ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/50 md:bg-slate-500 rounded-full animate-pulse animation-delay-500" />
                <span>Настройки</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/50 md:bg-zinc-500 rounded-full animate-pulse animation-delay-1000" />
                <span>Интерфейс</span>
              </div>
            </div>

            {/* Статус - адаптивные цвета */}
            <div className="text-xs text-white/50 md:text-gray-400 space-y-1">
              <p>FitFlow Pro Staff Portal</p>
              <p className="animate-pulse">👔 Портал для персонала</p>
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

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<StaffLoginLoading />}>
      <StaffLoginContent />
    </Suspense>
  );
}