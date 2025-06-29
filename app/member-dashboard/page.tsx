// app/member-dashboard/page.tsx - исправленная версия
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useApiRequest } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Heart, Zap, Home, Target, Loader2 } from "lucide-react";

import { useWelcomeToast } from "@/hooks/useWelcomeToast"

// Импортируем компоненты
import { MemberHeader } from "@/components/member/MemberHeader";
import QuickActions from "@/components/member/QuickActions";
import MemberProgress from "@/components/member/MemberProgress";
import UpcomingWorkouts from "@/components/member/UpcomingWorkouts";
import NextWorkout from "@/components/member/NextWorkout";
import FaceIdCard from "@/components/member/FaceIdCard";
import MiniProgress from "@/components/member/MiniProgress";
import SidebarCards from "@/components/member/SidebarCards";
import TipsSection from "@/components/member/TipsSection";
import FitnessLoader from "@/components/ui/FitnessLoader";
import StaffLogoutLoader from "../staff-login/components/StaffLogoutLoader";

interface Workout {
  id: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  price: number;
  notes?: string;
  category?: "trainer" | "program";
  trainerName?: string;
  trainerSpecializations?: string[];
  programTitle?: string;
  instructor?: string;
  createdAt: string;
}

interface FaceIdStatus {
  isEnabled: boolean;
  lastUsed?: string;
  dateRegistered?: string;
  deviceCount?: number;
}

export default function MemberDashboard() {
  useWelcomeToast()
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();
  const { get, post } = useApiRequest();
  const { toast } = useToast();

  // 🔧 НОВОЕ: Состояние для отслеживания процесса выхода
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Добавляем отладочную информацию
  useEffect(() => {
    console.log("🔍 MemberDashboard отладка:", {
      user,
      loading,
      isLoggingOut,
      timestamp: new Date().toISOString()
    });
  }, [user, loading, isLoggingOut]);

  // Состояния
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    totalHours: 0,
    daysLeft: 15,
  });

  const [faceIdStatus, setFaceIdStatus] = useState<FaceIdStatus>({
    isEnabled: false,
    lastUsed: undefined,
    dateRegistered: undefined,
    deviceCount: 0,
  });
  const [faceIdLoading, setFaceIdLoading] = useState(true);

  // 🔧 ИСПРАВЛЕННАЯ логика проверки авторизации с учетом процесса выхода
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔐 MemberDashboard: начало проверки авторизации");

      // 🔧 ВАЖНО: Если идет процесс выхода - не проверяем доступ
      if (isLoggingOut) {
        console.log("🚪 MemberDashboard: идет процесс выхода, пропускаем проверки...");
        return;
      }

      // Если еще идет загрузка - ждем
      if (loading) {
        console.log("⏳ MemberDashboard: ожидаем завершения загрузки auth...");
        return;
      }

      // Проверяем localStorage на наличие сохраненных данных
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');

      console.log("📦 MemberDashboard: данные из localStorage:", {
        hasUser: !!storedUser,
        hasToken: !!storedToken,
        currentUser: user
      });

      // Если нет пользователя после загрузки
      if (!user) {
        console.log("❌ MemberDashboard: нет пользователя после загрузки");

        // Пробуем обновить данные пользователя если есть сохраненные данные
        if (storedUser && storedToken) {
          console.log("🔄 MemberDashboard: пробуем refreshUser");
          try {
            await refreshUser();
            // После refreshUser снова проверим пользователя
            return;
          } catch (error) {
            console.error("❌ MemberDashboard: ошибка refreshUser:", error);
          }
        }

        // Если нет сохраненных данных - отказываем в доступе
        console.log("🚫 MemberDashboard: нет сохраненных данных, отказ в доступе");
        setAccessDenied(true);
        setAuthChecked(true);
        return;
      }

      // Проверяем роль пользователя
      if (user.role !== "member" && user.role !== "client") {
        console.log("🚫 MemberDashboard: неправильная роль:", user.role);
        setAccessDenied(true);
        setAuthChecked(true);
        return;
      }

      // Все проверки пройдены
      console.log("✅ MemberDashboard: авторизация успешна");
      setAuthChecked(true);
    };

    checkAuth();
  }, [loading, user, refreshUser, isLoggingOut]); // 🔧 Добавили isLoggingOut в зависимости

  // Загружаем данные только если пользователь авторизован и проверки пройдены
  useEffect(() => {
    if (authChecked && user && (user.role === "member" || user.role === "client") && !accessDenied && !isLoggingOut) {
      console.log("✅ MemberDashboard: загружаем данные пользователя");
      fetchWorkouts();
      checkFaceIdStatus();
    }
  }, [authChecked, user, accessDenied, isLoggingOut]);

  const fetchWorkouts = async () => {
    try {
      setWorkoutsLoading(true);
      const data = await get("/api/my-workouts");

      if (data.success) {
        setWorkouts(data.workouts);
        calculateStats(data.workouts);
      }
    } catch (error) {
      console.error("❌ Ошибка запроса тренировок:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить тренировки",
      });
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const checkFaceIdStatus = async () => {
    try {
      setFaceIdLoading(true);
      console.log("🔍 Проверяем статус Face ID...");

      const data = await get("/api/face-id/status");

      if (data.success) {
        setFaceIdStatus({
          isEnabled: data.isEnabled || false,
          lastUsed: data.lastUsed,
          dateRegistered: data.dateRegistered,
          deviceCount: data.deviceCount || 0,
        });
        console.log("✅ Face ID статус получен:", data);
      } else {
        console.log("❌ Face ID не настроен или ошибка:", data.error);
        setFaceIdStatus({
          isEnabled: false,
          lastUsed: undefined,
          dateRegistered: undefined,
          deviceCount: 0,
        });
      }
    } catch (error) {
      console.error("❌ Ошибка проверки Face ID:", error);
      setFaceIdStatus({
        isEnabled: false,
        lastUsed: undefined,
        dateRegistered: undefined,
        deviceCount: 0,
      });
    } finally {
      setFaceIdLoading(false);
    }
  };

  const handleDisableFaceId = async () => {
    try {
      const data = await post("/api/face-id/disable", {});

      if (data.success) {
        setFaceIdStatus({
          isEnabled: false,
          lastUsed: undefined,
          dateRegistered: undefined,
          deviceCount: 0,
        });
        toast({
          title: "✅ Face ID отключен",
          description: "Биометрические данные удалены из системы",
        });
      } else {
        throw new Error(data.error || "Ошибка отключения Face ID");
      }
    } catch (error) {
      console.error("❌ Ошибка отключения Face ID:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отключить Face ID",
      });
    }
  };

  const handleTestFaceId = () => {
    const testUrl = `/auth/face-auth?mode=test&session=${Date.now()}`;
    window.open(testUrl, "_blank");

    toast({
      title: "🔍 Тестирование Face ID",
      description: "Откройте новую вкладку для тестирования входа",
    });
  };

  const calculateStats = (workouts: Workout[]) => {
    const now = new Date();
    const upcoming = workouts.filter(
      (w) => new Date(w.date) > now && w.status !== "cancelled"
    ).length;
    const completed = workouts.filter((w) => w.status === "completed").length;
    const totalHours = workouts
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.duration / 60, 0);

    setStats({
      upcoming,
      completed,
      totalHours: Math.round(totalHours),
      daysLeft: 15,
    });
  };

  // 🔧 ИСПРАВЛЕННАЯ функция выхода с предотвращением показа "Доступ запрещен"
  const handleLogout = async () => {
    try {
      console.log("🚪 MemberDashboard: начинаем процесс выхода...");

      // 🔧 ВАЖНО: Устанавливаем флаг выхода ПЕРЕД вызовом logout
      setIsLoggingOut(true);

      // Выполняем выход через useAuth
      await logout();
    } catch (error) {
      console.error("❌ Ошибка выхода:", error);
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  const goToHomePage = () => {
    console.log("🏠 MemberDashboard: переход на главную страницу...");
    router.push("/");
  };

  // Получаем следующую тренировку
  const upcomingWorkouts = workouts
    .filter((w) => new Date(w.date) > new Date() && w.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextWorkout = upcomingWorkouts.length > 0 ? upcomingWorkouts[0] : null;


  // Показываем загрузку если идет первоначальная загрузка auth, проверка доступа или процесс выхода
  if (isLoggingOut) {
    return (
      <StaffLogoutLoader
        userRole={user?.role || "member"}
        userName={user?.name || "Пользователь"}
        redirectUrl="/"
      />
    );
  }

  // 🔧 ИСПРАВЛЕННАЯ проверка доступа - НЕ показываем если идет процесс выхода
  if (!isLoggingOut && (accessDenied || !user || (user.role !== "member" && user.role !== "client"))) {
    console.log("🚫 MemberDashboard: показываем отказ в доступе", {
      accessDenied,
      hasUser: !!user,
      userRole: user?.role,
      expectedRoles: ["member", "client"],
      isLoggingOut
    });

    return (
      <div className="min-h-[100svh] bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Доступ запрещен
            </h2>
            <p className="text-gray-600 mb-6">
              У вас нет прав для доступа к панели участников.
              {user ? ` Ваша роль: ${user.role}` : " Требуется авторизация."}
            </p>
            <div className="space-y-3">
              <Button
                onClick={goToHomePage}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                На главную страницу
              </Button>
              {user && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  Выйти из аккаунта
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Основной контент дашборда
  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-blue-50 to-green-50">
      {/* Хедер */}
      <MemberHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-center md:text-start">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Добро пожаловать, <br />{user?.name || user?.email.split("@")[0]}!
                </h1>
                <p className="text-lg text-gray-600">
                  Ваш путь к здоровью и отличной форме
                </p>
              </div>
            </div>

            <Button
              onClick={goToHomePage}
              variant="outline"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2 hover:shadow-md transition-all text-white hover:text-white"
            >
              <Home className="h-4 w-4" />
              На главную
            </Button>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Быстрые действия
          </h2>
          <QuickActions stats={stats} />
        </div>

        {/* Основной контент - секция тренировок */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* ЛЕВАЯ КОЛОНКА - Ближайшие тренировки */}
          <div className="lg:col-span-2">
            <UpcomingWorkouts
              workouts={workouts}
              isLoading={workoutsLoading}
              stats={stats}
            />
          </div>

          {/* ПРАВАЯ КОЛОНКА - Боковые карточки */}
          <div className="space-y-6">
            {/* Следующая тренировка */}
            <NextWorkout workout={nextWorkout} isLoading={workoutsLoading} />

            {/* Face ID карточка */}
            <FaceIdCard
              status={faceIdStatus}
              isLoading={faceIdLoading}
              onTest={handleTestFaceId}
              onDisable={handleDisableFaceId}
            />

            {/* Мини прогресс */}
            <MiniProgress stats={stats} />

            {/* Боковые карточки */}
            <SidebarCards stats={stats} onGoHome={goToHomePage} />
          </div>
        </div>

        {/* Полный компонент прогресса */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Ваш прогресс и достижения
          </h2>
          <MemberProgress />
        </div>

        {/* Советы */}
        <TipsSection />
      </div>
    </div>
  );
}