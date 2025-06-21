// app/member-dashboard/page.tsx - отладочная версия
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useApiRequest } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Heart, Zap, Home, Target, Loader2 } from "lucide-react";

// Импортируем компоненты
import {MemberHeader} from "@/components/member/MemberHeader";
import QuickActions from "@/components/member/QuickActions";
import MemberProgress from "@/components/member/MemberProgress";
import UpcomingWorkouts from "@/components/member/UpcomingWorkouts";
import NextWorkout from "@/components/member/NextWorkout";
import FaceIdCard from "@/components/member/FaceIdCard";
import MiniProgress from "@/components/member/MiniProgress";
import SidebarCards from "@/components/member/SidebarCards";
import TipsSection from "@/components/member/TipsSection";

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
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();
  const { get, post } = useApiRequest();
  const { toast } = useToast();
  
  // Добавляем отладочную информацию
  useEffect(() => {
    console.log("🔍 MemberDashboard отладка:", {
      user,
      loading,
      timestamp: new Date().toISOString()
    });
  }, [user, loading]);

  // Состояния
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
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

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔐 MemberDashboard: начало проверки авторизации");
      
      // Проверяем localStorage на наличие сохраненных данных
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      
      console.log("📦 MemberDashboard: данные из localStorage:", {
        hasUser: !!storedUser,
        hasToken: !!storedToken
      });
      
      // Если нет пользователя и загрузка завершена
      if (!loading && !user) {
        console.log("❌ MemberDashboard: нет пользователя после загрузки");
        
        // Пробуем обновить данные пользователя
        if (storedUser) {
          console.log("🔄 MemberDashboard: пробуем refreshUser");
          await refreshUser();
        }
      }
      
      setAuthChecked(true);
    };
    
    if (!loading) {
      checkAuth();
    }
  }, [loading, user, refreshUser]);

  // Загружаем данные только если пользователь авторизован
  useEffect(() => {
    if (user && (user.role === "member" || user.role === "client")) {
      console.log("✅ MemberDashboard: пользователь авторизован, загружаем данные");
      fetchWorkouts();
      checkFaceIdStatus();
    }
  }, [user]);

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

  const handleLogout = async () => {
    try {
      console.log("🚪 MemberDashboard: выполняем выход через useAuth...");
      await logout();
    } catch (error) {
      console.error("❌ Ошибка выхода:", error);
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

  // Состояния загрузки
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка дашборда...</p>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "Проверка авторизации..." : "Загрузка данных..."}
          </p>
        </div>
      </div>
    );
  }

  // Проверка доступа
  if (!user || (user.role !== "member" && user.role !== "client")) {
    console.log("🚫 MemberDashboard: отказ в доступе", {
      hasUser: !!user,
      userRole: user?.role,
      expectedRoles: ["member", "client"]
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Загрузка панели персонала...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Основной контент дашборда
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Хедер */}
      <MemberHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-center md:text-start">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Добро пожаловать, <br />{user.name || user.email.split("@")[0]}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                  Ваш путь к здоровью и отличной форме
                </p>
              </div>
            </div>

            <Button
              onClick={goToHomePage}
              variant="outline"
              className="flex items-center gap-2 hover:shadow-md transition-all"
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