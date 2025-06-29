// app/offline/page.tsx - Страница для офлайн режима
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  User, 
  Calendar, 
  Smartphone,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { PWAStatus } from '@/components/PWAStatus';
import usePWA from '@/hooks/usePWA';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { isOnline } = usePWA();
  const router = useRouter()

  useEffect(() => {
    // Проверяем последнее обновление данных
    const stored = localStorage.getItem('last-data-update');
    if (stored) {
      setLastUpdate(new Date(stored));
    }
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Попытка перезагрузки страницы
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const offlineFeatures = [
    {
      name: "Просмотр профиля",
      description: "Личная информация и настройки",
      icon: User,
      available: true,
      path: "/profile"
    },
    {
      name: "Расписание",
      description: "Сохраненное расписание тренировок",
      icon: Calendar,
      available: true,
      path: "/schedule"
    },
    {
      name: "Главная страница",
      description: "Основная информация",
      icon: Home,
      available: true,
      path: "/"
    },
    {
      name: "PWA настройки",
      description: "Управление приложением",
      icon: Smartphone,
      available: true,
      path: "/pwa"
    }
  ];

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Главная карточка офлайн статуса */}
        <Card className="border-orange-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-900">
              Вы работаете в офлайн режиме
            </CardTitle>
            <div className="flex items-center justify-center gap-2 mt-4">
              <PWAStatus showDetails={true} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Информация о последнем обновлении */}
            {lastUpdate && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-900">Последнее обновление данных</div>
                  <div className="text-sm text-blue-700">
                    {lastUpdate.toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
            )}

            {/* Статус сети */}
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${
              isOnline 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              {isOnline ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-900">Соединение восстановлено!</div>
                    <div className="text-sm text-green-700">
                      Вы можете обновить страницу для получения актуальных данных
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-orange-900">Нет подключения к интернету</div>
                    <div className="text-sm text-orange-700">
                      Некоторые функции могут быть недоступны
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Кнопка повтора */}
            <div className="text-center">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                                // Продолжение app/offline/page.tsx
                className={`${
                  isOnline 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Проверка соединения...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isOnline ? 'Обновить страницу' : 'Повторить попытку'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Доступные офлайн функции */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {offlineFeatures.map((feature) => (
            <Card 
              key={feature.name}
              className={`transition-all duration-200 cursor-pointer hover:scale-105 ${
                feature.available 
                  ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
              onClick={() => feature.available && (router.push(feature.path))}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                  feature.available ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.available ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <CardTitle className={`text-lg ${
                  feature.available ? 'text-green-900' : 'text-gray-500'
                }`}>
                  {feature.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${
                  feature.available ? 'text-green-700' : 'text-gray-400'
                }`}>
                  {feature.description}
                </p>
                {feature.available && (
                  <div className="mt-3 flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Доступно офлайн
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Советы по работе офлайн */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Советы по работе в офлайн режиме
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Данные автоматически синхронизируются при восстановлении соединения</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Формы сохраняются локально и отправляются позже</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Кешированные страницы работают без интернета</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>PWA приложение работает как нативное</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

