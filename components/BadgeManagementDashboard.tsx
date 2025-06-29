// components/BadgeManagementDashboard.tsx (исправленная версия)
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Search,
  RefreshCw,
  FileDown,
  FileUp,
  CheckSquare,
  XSquare,
  BarChart2,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { useHeaderBadgeManagement } from "@/hooks/useHeaderBadgeManagement";
import type { HeaderBadgeSetting } from '@/types/badge';
import BadgeIcon from "@/components/ui/BadgeIcon";
import { BadgeAnalyticsCard } from "@/components/BadgeAnalyticsCard";
import { ImportExportDialog } from "@/components/ImportExportDialog";

interface BadgeManagementDashboardProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (setting: HeaderBadgeSetting) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function BadgeManagementDashboard({
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onRefresh,
}: BadgeManagementDashboardProps) {
  const { toast } = useToast();
  const {
    allSettings,
    stats,
    isLoading,
    bulkDelete,
    bulkToggle,
    duplicateBadgeSetting,
    exportSettings,
    importSettings,
    getBadgeStats,
    searchSettings,
    filterByStatus,
    sortSettings,
    getSettingsByCategory,
    getTopBadgesByClicks,
    getLowPerformingBadges,
    refresh,
  } = useHeaderBadgeManagement();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [sortBy, setSortBy] = useState<"priority" | "created" | "updated" | "name">("priority");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Мемоизированные категории
  const categories = useMemo(() => {
    if (!getSettingsByCategory) {
      return {
        active: [],
        inactive: [],
        expired: [],
        scheduled: []
      };
    }
    return getSettingsByCategory();
  }, [getSettingsByCategory, allSettings]);

  // Мемоизированная фильтрация и сортировка
  const filteredSettings = useMemo(() => {
    let filtered = [...allSettings];

    // Поиск
    if (searchQuery && searchSettings) {
      filtered = searchSettings(searchQuery);
    }

    // Фильтр по статусу
    if (statusFilter !== "all" && filterByStatus) {
      filtered = filterByStatus(statusFilter);
    }

    // Сортировка
    if (sortSettings) {
      filtered = sortSettings(sortBy);
    }

    return filtered;
  }, [allSettings, searchQuery, statusFilter, sortBy, searchSettings, filterByStatus, sortSettings]);

  // Обработчики для массовых операций
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast({
        title: "Внимание",
        description: "Не выбрано ни одного badge для удаления",
        variant: "default",
      });
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить ${selectedIds.length} badge?`)) {
      return;
    }

    try {
      await bulkDelete(selectedIds);
      onSelectionChange([]);
      toast({
        title: "Успешно",
        description: `Удалено ${selectedIds.length} badge`,
        variant: "default",
      });
    } catch (error) {
      console.error("Ошибка массового удаления:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при массовом удалении",
        variant: "destructive",
      });
    }
  }, [selectedIds, bulkDelete, onSelectionChange, toast]);

  const handleBulkToggle = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast({
        title: "Внимание",
        description: "Не выбрано ни одного badge для переключения",
        variant: "default",
      });
      return;
    }

    try {
      await bulkToggle(selectedIds);
      toast({
        title: "Успешно",
        description: `Переключено состояние ${selectedIds.length} badge`,
        variant: "default",
      });
    } catch (error) {
      console.error("Ошибка массового переключения:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при массовом переключении",
        variant: "destructive",
      });
    }
  }, [selectedIds, bulkToggle, toast]);

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const duplicated = await duplicateBadgeSetting(id);
      toast({
        title: "Успешно",
        description: "Badge успешно дублирован",
        variant: "default",
      });
    } catch (error) {
      console.error("Ошибка дублирования:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при дублировании badge",
        variant: "destructive",
      });
    }
  }, [duplicateBadgeSetting, toast]);

  const handleExport = useCallback(() => {
    try {
      exportSettings();
      toast({
        title: "Успешно",
        description: "Настройки badge экспортированы",
        variant: "default",
      });
    } catch (error) {
      console.error("Ошибка экспорта:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при экспорте настроек",
        variant: "destructive",
      });
    }
  }, [exportSettings, toast]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const count = await importSettings(file);
      toast({
        title: "Успешно",
        description: `Импортировано ${count} badge`,
        variant: "default",
      });
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error("Ошибка импорта:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при импорте настроек",
        variant: "destructive",
      });
    }
  }, [importSettings, toast]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      onRefresh();
      toast({
        title: "Успешно",
        description: "Данные обновлены",
        variant: "default",
      });
    } catch (error) {
      console.error("Ошибка обновления:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при обновлении данных",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh, onRefresh, toast]);

  // Обработчик выбора всех элементов
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredSettings.map(setting => setting._id));
    } else {
      onSelectionChange([]);
    }
  }, [filteredSettings, onSelectionChange]);

  // Обработчик выбора одного элемента
  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  }, [selectedIds, onSelectionChange]);

  return (
    <div className="space-y-6">
      {/* Верхняя панель с фильтрами и действиями */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Поиск badge..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Фильтры
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Статус</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Все
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Активные
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                Неактивные
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("expired")}>
                Истекшие
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Сортировка</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                По приоритету
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("created")}>
                По дате создания
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("updated")}>
                По дате обновления
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                По URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleBulkToggle}
              >
                <CheckSquare className="h-4 w-4" />
                Переключить {selectedIds.length}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4" />
                Удалить {selectedIds.length}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileUp className="h-4 w-4" />
            Импорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <FileDown className="h-4 w-4" />
            Экспорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Аналитика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BadgeAnalyticsCard
          title="Всего Badge"
          value={stats?.totalBadges || allSettings.length}
          icon={<BarChart2 className="h-5 w-5" />}
          description="Общее количество badge"
        />
        <BadgeAnalyticsCard
          title="Активные Badge"
          value={stats?.activeBadges || categories.active.length}
          icon={<CheckSquare className="h-5 w-5 text-green-500" />}
          description="Включенные и действующие"
        />
        <BadgeAnalyticsCard
          title="Показы"
          value={stats?.totalImpressions || 0}
          icon={<BarChart2 className="h-5 w-5 text-blue-500" />}
          description="Общее количество показов"
        />
        <BadgeAnalyticsCard
          title="Клики"
          value={stats?.totalClicks || 0}
          icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
          description={`CTR: ${stats?.averageCTR?.toFixed(2) || 0}%`}
        />
      </div>

      {/* Основная таблица */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Управление Badge</CardTitle>
          <CardDescription>
            Всего badge: {allSettings.length}, отфильтровано: {filteredSettings.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Все ({allSettings.length})</TabsTrigger>
              <TabsTrigger value="active">
                Активные ({categories.active.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Неактивные ({categories.inactive.length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Истекшие ({categories.expired.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <BadgeTable
                settings={filteredSettings}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={handleDuplicate}
                getBadgeStats={getBadgeStats}
              />
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              <BadgeTable
                settings={categories.active}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={handleDuplicate}
                getBadgeStats={getBadgeStats}
              />
            </TabsContent>
            <TabsContent value="inactive" className="mt-4">
              <BadgeTable
                settings={categories.inactive}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={handleDuplicate}
                getBadgeStats={getBadgeStats}
              />
            </TabsContent>
            <TabsContent value="expired" className="mt-4">
              <BadgeTable
                settings={categories.expired}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={handleDuplicate}
                getBadgeStats={getBadgeStats}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Диалог импорта */}
      <ImportExportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
      />
    </div>
  );
}

// Компонент таблицы Badge
interface BadgeTableProps {
  settings: HeaderBadgeSetting[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  onEdit: (setting: HeaderBadgeSetting) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  getBadgeStats: (id: string) => { impressions: number; clicks: number; ctr: string; lastShown: string } | null;
}

function BadgeTable({
  settings,
  selectedIds,
  onSelectAll,
  onSelectItem,
  onEdit,
  onDelete,
  onDuplicate,
  getBadgeStats,
}: BadgeTableProps) {
  const { toast } = useToast();

  const allSelected = useMemo(() => {
    return settings.length > 0 && settings.every(setting => selectedIds.includes(setting._id));
  }, [settings, selectedIds]);

  const formatDate = useCallback((timestamp?: number) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString();
  }, []);

  const handleSelectAllChange = useCallback((checked: boolean) => {
    onSelectAll(checked);
  }, [onSelectAll]);

  const handleSelectItemChange = useCallback((id: string, checked: boolean) => {
    onSelectItem(id, checked);
  }, [onSelectItem]);

  const handleEditClick = useCallback((setting: HeaderBadgeSetting) => {
    onEdit(setting);
  }, [onEdit]);

  const handleDeleteClick = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  const handleDuplicateClick = useCallback((id: string) => {
    onDuplicate(id);
  }, [onDuplicate]);

  return (
    <div className="border rounded-md">
      <ScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAllChange}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-12">Badge</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Текст</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead>Статистика</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Нет данных для отображения
                </TableCell>
              </TableRow>
            ) : (
              settings.map((setting) => {
                const stats = getBadgeStats(setting._id);
                const isExpired = setting.validTo && setting.validTo < Date.now();
                const isScheduled = setting.validFrom && setting.validFrom > Date.now();

                return (
                  <TableRow key={setting._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(setting._id)}
                        onCheckedChange={(checked) => handleSelectItemChange(setting._id, !!checked)}
                        aria-label={`Select ${setting.badgeText}`}
                      />
                    </TableCell>
                    <TableCell className="relative">
                      <BadgeIcon
                        variant={setting.badgeVariant}
                        text={setting.badgeText}
                        size="sm"
                        className="static"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {setting.navigationItemHref}
                    </TableCell>
                    <TableCell>{setting.badgeText}</TableCell>
                    <TableCell>{setting.priority}</TableCell>
                    <TableCell>
                      {setting.badgeEnabled ? (
                        isExpired ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                            Истек
                          </Badge>
                        ) : isScheduled ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                            Запланирован
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            Активен
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                          Отключен
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDate(setting.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {stats ? (
                        <div>
                          <div>Показы: {stats.impressions}</div>
                          <div>Клики: {stats.clicks}</div>
                          <div>CTR: {stats.ctr}%</div>
                        </div>
                      ) : (
                        "Нет данных"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(setting)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateClick(setting._id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Дублировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(setting._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

