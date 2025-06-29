// app/admin/users/components/tabs/ActionsTab.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Mail,
  Download,
  Upload,
  FileText,
  Send,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useUsersPage } from "../../providers/UsersPageProvider";

export const ActionsTab = React.memo(() => {
  const { state, permissions, actions } = useUsersPage();
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
    recipients: "all" as "all" | "active" | "inactive" | "role",
  });
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  // Быстрые действия
  const quickActions = [
    {
      title: "Экспорт всех пользователей",
      description: "Скачать CSV файл со всеми пользователями",
      icon: Download,
      action: () =>
        actions.bulkAction(
          "export",
          state.users.map((u) => u.id)
        ),
      disabled: false,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Активировать всех",
      description: "Активировать всех неактивных пользователей",
      icon: CheckCircle,
      action: () => {
        const inactiveUsers = state.users
          .filter((u) => !u.isActive)
          .map((u) => u.id);
        if (inactiveUsers.length > 0) {
          actions.bulkAction("activate", inactiveUsers);
        }
      },
      disabled:
        !permissions.canUpdate ||
        state.users.filter((u) => !u.isActive).length === 0,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Деактивировать неактивных",
      description: "Деактивировать пользователей без активности",
      icon: AlertTriangle,
      action: () => {
        // Логика определения неактивных пользователей (например, не заходили больше 30 дней)
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        const inactiveUsers = state.users
          .filter(
            (u) => u.isActive && (!u.lastLogin || u.lastLogin < thirtyDaysAgo)
          )
          .map((u) => u.id);

        if (inactiveUsers.length > 0) {
          actions.bulkAction("deactivate", inactiveUsers);
        }
      },
      disabled: !permissions.canUpdate,
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  // Отправка email
  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      alert("Заполните тему и сообщение");
      return;
    }

    setLoading(true);
    try {
      // Определяем получателей
      let recipients: string[] = [];

      switch (emailData.recipients) {
        case "all":
          recipients = state.users.map((u) => u.id);
          break;
        case "active":
          recipients = state.users.filter((u) => u.isActive).map((u) => u.id);
          break;
        case "inactive":
          recipients = state.users.filter((u) => !u.isActive).map((u) => u.id);
          break;
        case "role":
          if (selectedRole) {
            recipients = state.users
              .filter((u) => u.role === selectedRole)
              .map((u) => u.id);
          }
          break;
      }

      if (recipients.length === 0) {
        alert("Нет получателей для отправки");
        return;
      }

      // Здесь должен быть API вызов для отправки email
      console.log("Отправка email:", {
        subject: emailData.subject,
        message: emailData.message,
        recipients,
      });

      alert(`Email отправлен ${recipients.length} получателям`);

      // Очищаем форму
      setEmailData({
        subject: "",
        message: "",
        recipients: "all",
      });
      setSelectedRole("");
    } catch (error) {
      console.error("Ошибка отправки email:", error);
      alert("Ошибка отправки email");
    } finally {
      setLoading(false);
    }
  };

  // Импорт пользователей
  const handleImportUsers = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Здесь должна быть логика импорта
        console.log("Импорт файла:", file.name);
        alert("Функция импорта будет реализована");
      }
    };
    input.click();
  };

  const getRecipientsCount = () => {
    switch (emailData.recipients) {
      case "all":
        return state.users.length;
      case "active":
        return state.users.filter((u) => u.isActive).length;
      case "inactive":
        return state.users.filter((u) => !u.isActive).length;
      case "role":
        return selectedRole
          ? state.users.filter((u) => u.role === selectedRole).length
          : 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-8">
      {/* Быстрые действия */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  disabled={action.disabled}
                  className={`h-auto p-4 flex flex-col items-center gap-3 text-white ${action.color} ${
                    action.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center text-balance">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90 mt-1">
                      {action.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Массовая отправка email */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Массовая отправка email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Получатели */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipients">Получатели</Label>
              <Select
                value={emailData.recipients}
                onValueChange={(value: any) =>
                  setEmailData((prev) => ({ ...prev, recipients: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все пользователи</SelectItem>
                  <SelectItem value="active">Активные пользователи</SelectItem>
                  <SelectItem value="inactive">
                    Неактивные пользователи
                  </SelectItem>
                  <SelectItem value="role">По роли</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {emailData.recipients === "role" && (
              <div>
                <Label htmlFor="role">Роль</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">Супер админы</SelectItem>
                    <SelectItem value="admin">Администраторы</SelectItem>
                    <SelectItem value="manager">Менеджеры</SelectItem>
                    <SelectItem value="trainer">Тренеры</SelectItem>
                    <SelectItem value="member">Участники</SelectItem>
                    <SelectItem value="client">Клиенты</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Информация о получателях */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                Будет отправлено {getRecipientsCount()} получателям
              </span>
            </div>
          </div>

          {/* Тема */}
          <div>
            <Label htmlFor="subject">Тема письма</Label>
            <Input
              id="subject"
              placeholder="Введите тему письма"
              value={emailData.subject}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="mt-1"
            />
          </div>

          {/* Сообщение */}
          <div>
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              placeholder="Введите текст сообщения"
              value={emailData.message}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="mt-1 min-h-[120px]"
            />
          </div>

          {/* Кнопка отправки */}
          <Button
            onClick={handleSendEmail}
            disabled={
              loading || !emailData.subject.trim() || !emailData.message.trim()
            }
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Отправляется...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Отправить email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Импорт/Экспорт */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Импорт */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Импорт пользователей
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Загрузите CSV или Excel файл с данными пользователей для массового
              импорта.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Перетащите файл сюда или нажмите для выбора
              </p>
              <Button
                onClick={handleImportUsers}
                variant="outline"
                disabled={!permissions.canCreate}
              >
                <Upload className="h-4 w-4 mr-2" />
                Выбрать файл
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              <p>Поддерживаемые форматы: CSV, XLSX</p>
              <p>Максимальный размер: 10 МБ</p>
            </div>
          </CardContent>
        </Card>

        {/* Экспорт */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Экспорт данных
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Экспортируйте данные пользователей в различных форматах.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() =>
                  actions.bulkAction(
                    "export",
                    state.users.map((u) => u.id)
                  )
                }
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2 " />
                Экспорт всех пользователей (CSV)
              </Button>

              <Button
                onClick={() => {
                  const activeUsers = state.users
                    .filter((u) => u.isActive)
                    .map((u) => u.id);
                  actions.bulkAction("export", activeUsers);
                }}
                variant="outline"
                className="w-full justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Экспорт активных пользователей
              </Button>

              <Button
                onClick={() => {
                  const adminUsers = state.users
                    .filter((u) => ["admin", "super-admin"].includes(u.role))
                    .map((u) => u.id);
                  actions.bulkAction("export", adminUsers);
                }}
                variant="outline"
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Экспорт администраторов
              </Button>

              <Button
                onClick={() => {
                  const clientUsers = state.users
                    .filter((u) => u.role === "client")
                    .map((u) => u.id);
                  actions.bulkAction("export", clientUsers);
                }}
                variant="outline"
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Экспорт клиентов
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика действий */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle>Статистика по действиям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {state.users.length}
              </div>
              <div className="text-sm text-gray-600">Всего пользователей</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {state.users.filter((u) => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Активных</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {state.users.filter((u) => !u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Неактивных</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {state.selectedUsers.size}
              </div>
              <div className="text-sm text-gray-600">Выбрано</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ActionsTab.displayName = "ActionsTab";
