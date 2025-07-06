// components/admin/schedule/SchedulePage/ScheduleTabsContainer.tsx
import React, { memo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  List, 
  BarChart3, 
  Users, 
  ChevronDown,
  Grid3X3,
  Sparkles
} from "lucide-react";
import { ScheduleEvent } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Импортируем компоненты напрямую
import CalendarView from "../CalendarView";
import EventsList from "../EventsList";
import TrainerWorkload from "../TrainerWorkload";
import AnalyticsView from "./AnalyticsView";

interface ScheduleTabsContainerProps {
  events: ScheduleEvent[];
  trainers: any[];
  stats: any;
  pageState: any;
  onDeleteEvent: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  gradient: string;
  description: string;
  bgColor: string;
  textColor: string;
}

const ScheduleTabsContainer = memo(function ScheduleTabsContainer({
  events,
  trainers,
  stats,
  pageState,
  onDeleteEvent,
  onStatusChange,
}: ScheduleTabsContainerProps) {
  const [activeTab, setActiveTab] = useState("calendar");
  const [isMobile, setIsMobile] = useState(false);

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Конфигурация табов с красивыми градиентами
  const tabsConfig: TabConfig[] = [
    {
      id: "calendar",
      label: "Календарь",
      icon: <Calendar className="w-5 h-5" />,
      count: events.length,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      description: "Просмотр событий в календаре"
    },
    {
      id: "list",
      label: "Список",
      icon: <List className="w-5 h-5" />,
      count: events.filter(e => e.status === 'scheduled').length,
      gradient: "from-emerald-500 via-emerald-600 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      description: "Список всех событий"
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: <BarChart3 className="w-5 h-5" />,
      gradient: "from-purple-500 via-purple-600 to-violet-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      description: "Статистика и отчеты"
    },
    {
      id: "workload",
      label: "Загрузка",
      icon: <Users className="w-5 h-5" />,
      count: trainers.length,
      gradient: "from-orange-500 via-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      description: "Загрузка тренеров"
    },
  ];

  const activeTabConfig = tabsConfig.find(tab => tab.id === activeTab);

  // Мобильный дропдаун для табов
  const MobileTabSelector = () => (
    <div className="md:hidden mb-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-16 bg-white/80 backdrop-blur-sm 
                     border-2 border-gray-200/60 hover:border-gray-300/80
                     shadow-lg hover:shadow-xl transition-all duration-300
                     rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <div className={`
                p-3 rounded-xl bg-gradient-to-r ${activeTabConfig?.gradient} 
                text-white shadow-lg
              `}>
                {activeTabConfig?.icon}
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 text-lg">
                  {activeTabConfig?.label}
                </div>
                <div className="text-sm text-gray-500">
                  {activeTabConfig?.description}
                </div>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-3 bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl">
          {tabsConfig.map((tab) => (
            <DropdownMenuItem
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                p-4 rounded-xl cursor-pointer transition-all duration-300 mb-2
                ${activeTab === tab.id 
                  ? `${tab.bgColor} shadow-lg border border-gray-200/50` 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-4 w-full">
                <div className={`
                  p-3 rounded-xl bg-gradient-to-r ${tab.gradient} text-white
                  shadow-lg transition-transform duration-300
                  ${activeTab === tab.id ? 'scale-110' : 'scale-100'}
                `}>
                  {tab.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">
                    {tab.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tab.description}
                  </div>
                </div>
                {tab.count !== undefined && (
                  <div className={`
                    px-3 py-1.5 rounded-full text-sm font-bold
                    ${activeTab === tab.id 
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md` 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {tab.count}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок с анимацией */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 
                            rounded-3xl shadow-2xl shadow-blue-200/50">
                <Grid3X3 className="w-5 sm:w-8 h-5 sm:h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center sm:text-start">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Управление расписанием
              </h1>
              <p className="text-gray-600 text-base lg:text-lg mt-2">
                Планирование и контроль занятий
              </p>
            </div>
          </div>
          
          {/* Статистика в заголовке */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: "Всего событий", 
                value: events.length, 
                gradient: "from-blue-500 to-blue-600",
                bg: "bg-blue-50",
                icon: "📅"
              },
              { 
                label: "Запланировано", 
                value: events.filter(e => e.status === 'scheduled').length, 
                gradient: "from-yellow-500 to-orange-500",
                bg: "bg-yellow-50",
                icon: "⏰"
              },
              { 
                label: "Подтверждено", 
                value: events.filter(e => e.status === 'confirmed').length, 
                gradient: "from-green-500 to-emerald-500",
                bg: "bg-green-50",
                icon: "✅"
              },
              { 
                label: "Тренеров", 
                value: trainers.length, 
                gradient: "from-purple-500 to-violet-500",
                bg: "bg-purple-50",
                icon: "👥"
              },
            ].map((stat, index) => (
              <div key={index} className={`
                ${stat.bg} rounded-2xl p-6 shadow-lg border border-white/50
                hover:shadow-xl hover:scale-[1.02] transition-all duration-300
                backdrop-blur-sm relative overflow-hidden group
              `}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 sm:gap-0 justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                  <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className={`
                  absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient}
                  w-full transform scale-x-0 group-hover:scale-x-100 
                  transition-transform duration-300 origin-left
                `} />
              </div>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Мобильный селектор */}
          <MobileTabSelector />
          
          {/* Красивые десктопные табы */}
          <div className="hidden md:block mb-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/20">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 gap-2">
                {tabsConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`
                      relative flex flex-col items-center justify-center p-6 rounded-2xl
                      transition-all duration-500 ease-out group
                      data-[state=active]:bg-white 
                      data-[state=active]:shadow-2xl 
                      data-[state=active]:shadow-gray-300/30
                      data-[state=active]:scale-[1.02]
                      data-[state=active]:border-0
                      hover:bg-white/70 hover:shadow-lg
                      text-gray-600 data-[state=active]:text-gray-900
                      font-semibold border-0 min-h-[120px]
                      data-[state=inactive]:hover:scale-[1.01]
                    `}
                  >
                    {/* Градиентный фон для активного таба */}
                    <div className={`
                      absolute inset-0 rounded-2xl bg-gradient-to-br ${tab.gradient} 
                      opacity-0 group-data-[state=active]:opacity-[0.08] 
                      transition-opacity duration-500
                    `} />
                    
                    {/* Иконка с анимацией */}
                    <div className={`
                      relative p-3 rounded-xl transition-all duration-500 mb-3
                      group-data-[state=active]:bg-gradient-to-r 
                      group-data-[state=active]:${tab.gradient}
                      group-data-[state=active]:text-white
                      group-data-[state=active]:shadow-xl
                      group-data-[state=active]:shadow-gray-400/30
                      group-data-[state=active]:scale-110
                      group-hover:scale-105
                      bg-gray-100 text-gray-500
                      group-data-[state=active]:animate-pulse
                    `}>
                      {tab.icon}
                    </div>
                    
                    {/* Текст и счетчик */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <span className="text-base font-bold whitespace-nowrap">
                        {tab.label}
                      </span>
                      {tab.count !== undefined && (
                        <div className={`
                          px-3 py-1 rounded-full text-sm font-bold transition-all duration-500
                          group-data-[state=active]:bg-gradient-to-r 
                          group-data-[state=active]:${tab.gradient}
                          group-data-[state=active]:text-white
                          group-data-[state=active]:shadow-lg
                          group-data-[state=active]:scale-110
                          bg-gray-200 text-gray-600
                        `}>
                          {tab.count}
                        </div>
                      )}
                    </div>
                    
                    {/* Индикатор активного состояния */}
                    <div className={`
                      absolute bottom-2 left-1/2 transform -translate-x-1/2
                      w-12 h-1 rounded-full bg-gradient-to-r ${tab.gradient}
                      opacity-0 group-data-[state=active]:opacity-100
                      transition-all duration-500 ease-out
                      group-data-[state=active]:scale-100 scale-75
                      shadow-lg
                    `} />
                    
                    {/* Блеск при ховере */}
                    <div className={`
                      absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent
                      opacity-0 group-hover:opacity-100
                      transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%]
                      transition duration-500
                    `} />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Контент табов с анимацией */}
          <div className="relative">
            <TabsContent 
              value="calendar" 
              className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <CalendarView
                events={events}
                onEventClick={(event) => pageState.openEventDetails(event)}
                onCreateEvent={(date, hour) => pageState.openEventForm(null, date, hour)}
                onEditEvent={(event) => pageState.openEventForm(event)}
                onDeleteEvent={onDeleteEvent}
                onViewEventDetails={(event) => pageState.openEventDetails(event)}
                userRole="super-admin"
              />
            </TabsContent>

            <TabsContent 
              value="list" 
              className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <EventsList
                events={events}
                onEdit={(event) => pageState.openEventForm(event)}
                onDelete={onDeleteEvent}
                onStatusChange={onStatusChange}
              />
            </TabsContent>

            <TabsContent 
              value="analytics" 
              className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <AnalyticsView
                events={events}
                trainers={trainers}
                stats={stats}
              />
            </TabsContent>

            <TabsContent 
              value="workload" 
              className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <TrainerWorkload
                trainers={trainers}
                events={events}
                onEventClick={(event) => pageState.openEventDetails(event)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
});

export default ScheduleTabsContainer;
