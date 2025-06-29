// components/admin/BadgeManagementTabs.tsx
"use client";
import { useState} from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Clock,
  Target,
  Activity,
  Plus
} from "lucide-react";
import BadgeIcon from "@/components/ui/BadgeIcon";
import type { HeaderBadgeSetting } from "@/types/badge";
import { useHeaderBadgeManagement } from "@/hooks/useHeaderBadgeManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/useDashboardData";
import { useRouter } from "next/navigation";

interface BadgeManagementTabsProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRefresh: () => void;
  onEdit: (setting: HeaderBadgeSetting) => void;
  onDelete: (id: string) => void;
}

export function BadgeManagementTabs({
  selectedIds,
  onSelectionChange,
  onRefresh,
  onEdit,
  onDelete,
}: BadgeManagementTabsProps) {
  const { allSettings } = useHeaderBadgeManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useMediaQuery("(max-width: 640px)");
  const router = useRouter()
  
  // Фильтрация настроек с правильной типизацией
  const filteredSettings =
    allSettings?.filter((setting: HeaderBadgeSetting) => {
      const matchesSearch =
        setting.navigationItemHref
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        setting.badgeText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.badgeVariant.toLowerCase().includes(searchTerm.toLowerCase());

      switch (activeTab) {
        case "active":
          return matchesSearch && setting.badgeEnabled && setting.isActive;
        case "inactive":
          return matchesSearch && !setting.badgeEnabled;
        case "scheduled":
          return (
            matchesSearch && setting.validFrom && setting.validFrom > Date.now()
          );
        case "expired":
          return (
            matchesSearch && setting.validTo && setting.validTo < Date.now()
          );
        case "targeted":
          return (
            matchesSearch &&
            ((setting.targetRoles && setting.targetRoles.length > 0) ||
              (setting.targetDevices && setting.targetDevices.length > 0))
          );
        default:
          return matchesSearch;
      }
    }) || [];

  // Подсчет для вкладок с правильной типизацией
  const tabCounts = {
    all: allSettings?.length || 0,
    active:
      allSettings?.filter(
        (s: HeaderBadgeSetting) => s.badgeEnabled && s.isActive
      ).length || 0,
    inactive:
      allSettings?.filter((s: HeaderBadgeSetting) => !s.badgeEnabled).length ||
      0,
    scheduled:
      allSettings?.filter(
        (s: HeaderBadgeSetting) => s.validFrom && s.validFrom > Date.now()
      ).length || 0,
    expired:
      allSettings?.filter(
        (s: HeaderBadgeSetting) => s.validTo && s.validTo < Date.now()
      ).length || 0,
    targeted:
      allSettings?.filter(
        (s: HeaderBadgeSetting) =>
          (s.targetRoles && s.targetRoles.length > 0) ||
          (s.targetDevices && s.targetDevices.length > 0)
      ).length || 0,
  };

  const handleSelectSetting = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Компонент карточки с правильной типизацией
  const BadgeSettingCard = ({ setting }: { setting: HeaderBadgeSetting }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-3 px-3 sm:pb-3 sm:pt-4 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 sm:gap-3 items-center">
            <input
              type="checkbox"
              checked={selectedIds.includes(setting._id)}
              onChange={(e) =>
                handleSelectSetting(setting._id, e.target.checked)
              }
              className="rounded h-3 w-3 sm:h-4 sm:w-4"
            />
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-medium text-xs">
                  {setting.navigationItemHref
                    .split("/")
                    .pop()
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </span>
              </div>
              {setting.badgeEnabled && (
                <BadgeIcon
                  variant={setting.badgeVariant}
                  text={setting.badgeText || "DEMO"}
                  size="sm"
                />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[200px]">
                {setting.navigationItemHref}
              </CardTitle>
              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] sm:text-xs text-yellow-600 py-0 px-1 sm:px-2">
                  {setting.badgeVariant}
                </Badge>
                {setting.badgeText && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs py-0 px-1 sm:px-2">
                    {setting.badgeText}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {setting.badgeEnabled ? (
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            ) : (
              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8" onClick={() => onEdit(setting)}>
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 hover:text-red-700"
              onClick={() => onDelete(setting._id)}
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Приоритет:</span>
            <span className="font-medium">{setting.priority}</span>
          </div>

          {setting.analytics && (
            <div className="flex justify-between">
              <span>CTR:</span>
              <span className="font-medium">
                {setting.analytics.impressions > 0
                  ? (
                      (setting.analytics.clicks /
                        setting.analytics.impressions) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          )}

          {setting.targetRoles && setting.targetRoles.length > 0 && (
            <div>
              <span>Роли: </span>
              <span className="font-medium truncate block">
                {setting.targetRoles.join(", ")}
              </span>
            </div>
          )}

          {setting.targetDevices && setting.targetDevices.length > 0 && (
            <div>
              <span>Устройства: </span>
              <span className="font-medium truncate block">
                {setting.targetDevices.join(", ")}
              </span>
            </div>
          )}

          {setting.validFrom && (
            <div className="flex justify-between">
              <span>Начало:</span>
              <span className="font-medium">
                {formatDate(setting.validFrom)}
              </span>
            </div>
          )}

          {setting.validTo && (
            <div className="flex justify-between">
              <span>Конец:</span>
              <span className="font-medium">{formatDate(setting.validTo)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Поиск и фильтры */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
          <Input
            placeholder={isMobile ? "Поиск..." : "Поиск по href, тексту или типу badge..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 sm:h-10 text-xs sm:text-sm">
          <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Фильтры</span>
        </Button>
      </div>

      {/* Мобильное представление табов */}
      <div className="sm:hidden mb-3">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full text-xs">
            <SelectValue>
              {activeTab === "all" && "Все"}
              {activeTab === "active" && "Активные"}
              {activeTab === "inactive" && "Неактивные"}
              {activeTab === "scheduled" && "Запланированные"}
              {activeTab === "expired" && "Истекшие"}
              {activeTab === "targeted" && "Таргетированные"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="flex items-center gap-2 text-xs">
              <Activity className="h-3 w-3" />
              <span>Все ({tabCounts.all})</span>
            </SelectItem>
            <SelectItem value="active" className="flex items-center gap-2 text-xs">
              <Eye className="h-3 w-3" />
              <span>Активные ({tabCounts.active})</span>
            </SelectItem>
            <SelectItem value="inactive" className="flex items-center gap-2 text-xs">
              <EyeOff className="h-3 w-3" />
              <span>Неактивные ({tabCounts.inactive})</span>
            </SelectItem>
            <SelectItem value="scheduled" className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              <span>Запланированные ({tabCounts.scheduled})</span>
            </SelectItem>
            <SelectItem value="expired" className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              <span>Истекшие ({tabCounts.expired})</span>
            </SelectItem>
            <SelectItem value="targeted" className="flex items-center gap-2 text-xs">
              <Target className="h-3 w-3" />
              <span>Таргетированные ({tabCounts.targeted})</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Вкладки (только для планшетов и десктопов) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="all" className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
            <Activity className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Все ({tabCounts.all})</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Активные ({tabCounts.active})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
            <EyeOff className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Неактивные ({tabCounts.inactive})</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Запланированные ({tabCounts.scheduled})</span>
          </TabsTrigger>
                    <TabsTrigger value="expired" className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Истекшие ({tabCounts.expired})</span>
          </TabsTrigger>
          <TabsTrigger value="targeted" className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
            <Target className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Таргетированные ({tabCounts.targeted})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Контент вкладок (общий для мобильного и десктопного представления) */}
      <div className="space-y-4">
        {filteredSettings.length > 0 ? (
          <div className="grid gap-2 sm:gap-3 md:gap-4
                         grid-cols-1 
                         xs:grid-cols-2 
                         sm:grid-cols-2 
                         md:grid-cols-3 
                         lg:grid-cols-3 
                         xl:grid-cols-4 
                         2xl:grid-cols-5">
            {filteredSettings.map((setting: HeaderBadgeSetting) => (
              <BadgeSettingCard key={setting._id} setting={setting} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 md:py-12 border rounded-lg bg-gray-50/50">
            <div className="text-gray-400 mb-3 sm:mb-4">
              {searchTerm ? (
                <>
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium">
                    Ничего не найдено
                  </h3>
                  <p className="text-xs sm:text-sm">Попробуйте изменить поисковый запрос</p>
                </>
              ) : (
                <>
                  <Activity className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium">
                    {activeTab === "all" && "Нет настроек Badge"}
                    {activeTab === "active" && "Нет активных Badge"}
                    {activeTab === "inactive" && "Нет неактивных Badge"}
                    {activeTab === "scheduled" && "Нет запланированных Badge"}
                    {activeTab === "expired" && "Нет истекших Badge"}
                    {activeTab === "targeted" && "Нет таргетированных Badge"}
                  </h3>
                  <p className="text-xs sm:text-sm mt-1">
                    {activeTab === "all" && "Создайте первую настройку Badge"}
                    {activeTab === "active" &&
                      "Включите существующие Badge или создайте новые"}
                    {activeTab === "inactive" && "Все Badge активны"}
                    {activeTab === "scheduled" &&
                      "Нет Badge с будущей датой начала"}
                    {activeTab === "expired" && "Нет Badge с истекшим сроком"}
                    {activeTab === "targeted" &&
                      "Нет Badge с настройками таргетинга"}
                  </p>
                </>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-3 sm:mt-4 text-xs sm:text-sm"
              onClick={() => router.push('/badges/create')}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Создать Badge
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

