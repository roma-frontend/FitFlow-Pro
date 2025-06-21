// app/profile/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useRole } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Target,
  Trophy,
  Activity,
  Clock,
  Award,
  Star,
  Edit2,
  Camera,
  Shield,
  Bell,
  Smartphone,
  Lock,
  CreditCard,
  ChevronRight,
  Dumbbell,
  Flame,
  MapPin,
  Zap,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  
  const { upload, isUploading, error: uploadError } = useCloudinaryUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    router.push("/");
    return null;
  }

  // Моковые данные для демонстрации
  const stats = {
    totalWorkouts: 127,
    totalHours: 89,
    currentStreak: 12,
    personalRecords: 23,
    caloriesBurned: 45780,
    averageWorkoutTime: 42
  };

  const achievements = [
    { id: 1, title: "Первая тренировка", icon: Star, date: "2024-01-15", color: "text-yellow-500" },
    { id: 2, title: "7 дней подряд", icon: Flame, date: "2024-02-20", color: "text-orange-500" },
    { id: 3, title: "Месяц без пропусков", icon: Trophy, date: "2024-03-01", color: "text-purple-500" },
    { id: 4, title: "50 тренировок", icon: Award, date: "2024-04-10", color: "text-blue-500" },
    { id: 5, title: "100 тренировок", icon: Zap, date: "2024-06-15", color: "text-green-500" }
  ];

  const upcomingWorkouts = [
    { id: 1, name: "Силовая тренировка", trainer: "Александр Петров", date: "2024-06-22", time: "10:00" },
    { id: 2, name: "Йога", trainer: "Мария Иванова", date: "2024-06-24", time: "18:00" },
    { id: 3, name: "Кардио", trainer: "Дмитрий Сидоров", date: "2024-06-26", time: "09:00" }
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Обработчик изменения аватара
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log("📸 Начинаем загрузку аватара...");
      
      // Показываем превью сразу
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Загружаем в Cloudinary
      const uploadedUrl = await upload(file, {
        folder: 'user-avatars',
        uploadPreset: 'ml_default'
      });

      console.log("✅ Аватар загружен:", uploadedUrl);
      
      // Обновляем аватар на сервере
      const response = await fetch('/api/profile/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: uploadedUrl }),
      });

      if (response.ok) {
        setAvatarUrl(uploadedUrl);
        await refreshUser(); // Обновляем данные пользователя
        
        toast({
          title: "Успешно!",
          description: "Фото профиля обновлено",
        });
      } else {
        throw new Error('Не удалось обновить аватар на сервере');
      }
    } catch (error) {
      console.error("❌ Ошибка загрузки аватара:", error);
      
      // Возвращаем старый аватар при ошибке
      setAvatarUrl(user?.avatar || "");
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить фото",
      });
    }
  };

  // Эффект для синхронизации аватара с данными пользователя
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user?.avatar]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
          <p className="text-gray-600 mt-2">Управляйте своими данными и отслеживайте прогресс</p>
        </div>

        {/* Основная информация профиля */}
        <Card className="flex items-center mb-8 overflow-hidden relative min-h-64">
          {/* Градиент на весь фон */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 h-full" />

          <CardContent className="relative pt-4 sm:pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-3xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Кнопка загрузки фото */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>

                {/* Скрытый input для выбора файла */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              <div className="flex-1 text-center sm:text-left pb-4">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-200">
                    {user.name}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    PRO
                  </Badge>
                </div>
                <p className="text-gray-100 mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-1 text-sm text-gray-200">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Участник с{" "}
                      {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>Ереван</span>
                  </div>
                </div>
              </div>

              <Button className="mb-4" onClick={() => setIsEditing(!isEditing)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="h-8 w-8 text-blue-500" />
                <span className="text-xs text-gray-500">всего</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
              <p className="text-xs text-gray-600">тренировок</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-green-500" />
                <span className="text-xs text-gray-500">часов</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalHours}</p>
              <p className="text-xs text-gray-600">тренировок</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <span className="text-xs text-gray-500">дней</span>
              </div>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-gray-600">подряд</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <span className="text-xs text-gray-500">рекордов</span>
              </div>
              <p className="text-2xl font-bold">{stats.personalRecords}</p>
              <p className="text-xs text-gray-600">личных</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-8 w-8 text-purple-500" />
                <span className="text-xs text-gray-500">ккал</span>
              </div>
              <p className="text-2xl font-bold">{(stats.caloriesBurned / 1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-600">сожжено</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 text-indigo-500" />
                <span className="text-xs text-gray-500">мин</span>
              </div>
              <p className="text-2xl font-bold">{stats.averageWorkoutTime}</p>
              <p className="text-xs text-gray-600">в среднем</p>
            </CardContent>
          </Card>
        </div>

        {/* Табы с контентом */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
            <TabsTrigger value="workouts">Тренировки</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
            <TabsTrigger value="subscription">Подписка</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Прогресс по целям */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Мои цели
                </CardTitle>
                <CardDescription>Отслеживайте прогресс по вашим целям</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Снижение веса</span>
                    <span className="text-sm text-gray-500">7 из 10 кг</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Увеличение силы</span>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Выносливость</span>
                    <span className="text-sm text-gray-500">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Предстоящие тренировки */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Предстоящие тренировки
                </CardTitle>
                <CardDescription>Ваше расписание на ближайшие дни</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-gray-500">с {workout.trainer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{workout.time}</p>
                        <p className="text-xs text-gray-500">{new Date(workout.date).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Посмотреть все тренировки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Мои достижения
                </CardTitle>
                <CardDescription>Ваши заслуженные награды</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={achievement.id} className="text-center p-4 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="h-16 w-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon className={`h-8 w-8 ${achievement.color}`} />
                        </div>
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-purple-900">Следующее достижение</p>
                      <p className="text-sm text-purple-700">150 тренировок - осталось 23</p>
                    </div>
                    <Progress value={77} className="w-24 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  История тренировок
                </CardTitle>
                <CardDescription>Ваша активность за последний месяц</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {i}
                        </div>
                        <div>
                          <p className="font-medium">Функциональная тренировка</p>
                          <p className="text-sm text-gray-500">Тренер: Александр Петров</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">45 мин</p>
                        <p className="text-xs text-gray-500">320 ккал</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Загрузить еще
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки профиля</CardTitle>
                <CardDescription>Управляйте вашими личными данными и предпочтениями</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Личная информация */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Личная информация</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Полное имя</Label>
                      <Input id="name" defaultValue={user.name} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" type="tel" placeholder="+7 (999) 123-45-67" disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday">Дата рождения</Label>
                      <Input id="birthday" type="date" disabled={!isEditing} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Настройки уведомлений */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Уведомления
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email уведомления</p>
                        <p className="text-sm text-gray-500">Получать новости и обновления</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS напоминания</p>
                        <p className="text-sm text-gray-500">Напоминания о тренировках</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push-уведомления</p>
                        <p className="text-sm text-gray-500">В мобильном приложении</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Безопасность */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Безопасность
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Изменить пароль
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Двухфакторная аутентификация
                      </span>
                      <Badge variant="secondary">Включено</Badge>
                    </Button>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Face ID
                      </span>
                      <Badge variant="secondary">Настроено</Badge>
                    </Button>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">Сохранить изменения</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Моя подписка
                </CardTitle>
                <CardDescription>Управление вашим абонементом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">FitFlow Pro</h3>
                      <p className="text-blue-100">Безлимитный доступ</p>
                    </div>
                    <Badge className="bg-white text-blue-600">Активна</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Все групповые тренировки</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Персональные тренировки (5 в месяц)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Доступ к бассейну и сауне</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Питание и консультации</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/20">
                    <div>
                      <p className="text-sm text-blue-100">Следующий платеж</p>
                      <p className="font-semibold">22 июля 2024</p>
                    </div>
                    <p className="text-2xl font-bold">₽4,990/мес</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button variant="outline" className="w-full">
                    Изменить тариф
                  </Button>
                  <Button variant="outline" className="w-full">
                    История платежей
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                    Приостановить подписку
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}