// components/BadgeSettingDialog.tsx (исправленная версия с правильными типами)
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  BadgeFormData,
  BadgeVariant,
  createDefaultConditions,
  createDefaultFormData,
} from "@/types/badge";
import { validateBadgeFormData } from "@/utils/badgeUtils";
import BadgeIcon from "@/components/ui/BadgeIcon";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface BadgeSettingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BadgeFormData & { createdBy: string }) => Promise<void>;
  initialData: BadgeFormData | null;
  isEditing: boolean;
}

// Обновленная схема валидации с правильными типами
const badgeFormSchema = z.object({
  navigationItemHref: z.string().min(1, "URL обязателен"),
  badgeVariant: z.enum(
    [
      "quantum-ai",
      "neural-new",
      "holographic",
      "minimal",
      "cosmic",
      "matrix",
      "standard",
    ] as const,
    {
      required_error: "Вариант badge обязателен",
    }
  ),
  badgeText: z.string().min(1, "Текст badge обязателен"),
  badgeEnabled: z.boolean(),
  priority: z.coerce
    .number()
    .int()
    .min(0, "Приоритет должен быть положительным числом"),
  validFrom: z.date().nullable(),
  validTo: z.date().nullable(),
  targetRoles: z.array(z.string()),
  targetDevices: z.array(z.string()),
  conditions: z.object({
    requireAuth: z.boolean(),
    minUserLevel: z.number().int().min(0),
    showOnlyOnce: z.boolean(),
    hideAfterClick: z.boolean(),
  }),
});

type BadgeFormValues = z.infer<typeof badgeFormSchema>;

export function BadgeSettingDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isEditing,
}: BadgeSettingDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [previewVariant, setPreviewVariant] =
    useState<BadgeVariant>("standard");
  const [previewText, setPreviewText] = useState("Badge");

  // Создаем форму с правильными значениями по умолчанию
  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: {
      navigationItemHref: "",
      badgeVariant: "standard",
      badgeText: "New",
      badgeEnabled: false,
      priority: 100,
      validFrom: null,
      validTo: null,
      targetRoles: [],
      targetDevices: [],
      conditions: createDefaultConditions(),
    },
  });

  // Обновляем предпросмотр при изменении значений
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "badgeVariant" && value.badgeVariant) {
        setPreviewVariant(value.badgeVariant);
      }
      if (name === "badgeText" && value.badgeText) {
        setPreviewText(value.badgeText || "Badge");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Заполняем форму начальными данными
  useEffect(() => {
    if (initialData) {
      form.reset({
        navigationItemHref: initialData.navigationItemHref,
        badgeVariant: initialData.badgeVariant,
        badgeText: initialData.badgeText,
        badgeEnabled: initialData.badgeEnabled,
        priority: initialData.priority,
        validFrom: initialData.validFrom
          ? new Date(initialData.validFrom)
          : null,
        validTo: initialData.validTo ? new Date(initialData.validTo) : null,
        targetRoles: initialData.targetRoles || [],
        targetDevices: initialData.targetDevices || [],
        conditions: initialData.conditions || createDefaultConditions(),
      });
    }
  }, [initialData, form]);

  // Обработчик отправки формы
  const onSubmit = async (values: BadgeFormValues) => {
    // Преобразуем даты в timestamp
    const formData: BadgeFormData = {
      ...values,
      validFrom: values.validFrom ? values.validFrom.getTime() : undefined,
      validTo: values.validTo ? values.validTo.getTime() : undefined,
    };

    // Валидируем данные
    const validation = validateBadgeFormData(formData);
    if (!validation.isValid) {
      toast({
        title: "Ошибка валидации",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        createdBy: isEditing ? "manual-edit" : "manual-create",
      });
      toast({
        title: "Успешно",
        description: isEditing
          ? "Badge успешно обновлен"
          : "Badge успешно создан",
        variant: "default",
      });
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Ошибка при сохранении badge",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Обновленный список доступных вариантов badge
  const badgeVariants: {
    value: BadgeVariant;
    label: string;
    description: string;
  }[] = [
      {
        value: "standard",
        label: "Стандартный",
        description: "Классический стиль",
      },
      {
        value: "quantum-ai",
        label: "Quantum AI",
        description: "Футуристический AI стиль",
      },
      {
        value: "neural-new",
        label: "Neural New",
        description: "Нейронный дизайн",
      },
      {
        value: "holographic",
        label: "Голографический",
        description: "Голографический эффект",
      },
      { value: "minimal", label: "Минимальный", description: "Простой и чистый" },
      { value: "cosmic", label: "Космический", description: "Космическая тема" },
      { value: "matrix", label: "Матрица", description: "В стиле Matrix" },
    ];

  // Список доступных ролей
  const availableRoles = [
    "member",
    "client",
    "trainer",
    "manager",
    "admin",
    "super-admin",
    "staff",
  ] as const;

  // Список доступных типов устройств
  const availableDevices = ["desktop", "tablet", "mobile"] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-clip">
        <DialogHeader>
          <DialogTitle className="texxt-black">
            {isEditing ? "Редактировать Badge" : "Создать Badge"}
          </DialogTitle>
          <DialogDescription>
            Настройте параметры badge для навигационного элемента
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Основные</TabsTrigger>
                <TabsTrigger value="targeting">Таргетинг</TabsTrigger>
                <TabsTrigger value="conditions">Условия</TabsTrigger>
                <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
              </TabsList>

              {/* Основные настройки */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="navigationItemHref"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL элемента навигации</FormLabel>
                        <FormControl>
                          <Input placeholder="/dashboard" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL, на котором будет отображаться badge
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Приоритет</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="100"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Меньшее значение = более высокий приоритет
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="badgeText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Текст Badge</FormLabel>
                        <FormControl>
                          <Input placeholder="Новый" {...field} />
                        </FormControl>
                        <FormDescription>
                          Текст, отображаемый в badge
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="badgeVariant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Вариант Badge</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите вариант" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {badgeVariants.map((variant) => (
                              <SelectItem
                                key={variant.value}
                                value={variant.value}
                              >
                                <div className="flex items-center gap-2">
                                  <BadgeIcon
                                    variant={variant.value}
                                    text="Abc"
                                    size="sm"
                                  />
                                  <div className="flex flex-col items-start">
                                    <span>{variant.label}</span>
                                    <span className="text-xs text-gray-500">
                                      {variant.description}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Визуальный стиль badge
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Действует с</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Оставьте пустым для немедленного начала
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Действует до</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Оставьте пустым для бессрочного действия
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="badgeEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Активен</FormLabel>
                        <FormDescription>
                          Включить отображение badge
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Таргетинг */}
              <TabsContent value="targeting" className="space-y-4">
                <FormField
                  control={form.control}
                  name="targetRoles"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Роли пользователей
                        </FormLabel>
                        <FormDescription>
                          Выберите роли, для которых будет отображаться badge
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableRoles.map((role) => (
                          <FormField
                            key={role}
                            control={form.control}
                            name="targetRoles"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={role}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role)}
                                      onCheckedChange={(checked: boolean) => {
                                        return checked
                                          ? field.onChange([
                                            ...field.value,
                                            role,
                                          ])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value: string) =>
                                                value !== role
                                            )
                                          );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal capitalize">
                                    {role}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetDevices"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Типы устройств
                        </FormLabel>
                        <FormDescription>
                          Выберите устройства, на которых будет отображаться
                          badge
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableDevices.map((device) => (
                          <FormField
                            key={device}
                            control={form.control}
                            name="targetDevices"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={device}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(device)}
                                      onCheckedChange={(checked: boolean) => {
                                        return checked
                                          ? field.onChange([
                                            ...field.value,
                                            device,
                                          ])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value: string) =>
                                                value !== device
                                            )
                                          );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal capitalize">
                                    {device}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Условия */}
              <TabsContent value="conditions" className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="conditions.requireAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Требовать авторизацию
                          </FormLabel>
                          <FormDescription>
                            Показывать badge только авторизованным пользователям
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions.minUserLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Минимальный уровень пользователя</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Минимальный уровень пользователя для отображения badge
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions.showOnlyOnce"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Показать только один раз
                          </FormLabel>
                          <FormDescription>
                            Badge исчезнет после первого показа пользователю
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions.hideAfterClick"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Скрыть после клика
                          </FormLabel>
                          <FormDescription>
                            Badge исчезнет после клика пользователя
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Предпросмотр */}
              <TabsContent value="preview" className="space-y-4">
                <div className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">
                    Предпросмотр Badge
                  </h3>
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-500">
                        Внешний вид Badge
                      </h4>
                      <div className="flex items-center gap-2">
                        <BadgeIcon
                          variant={previewVariant}
                          text={previewText}
                        />
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-500">
                        Симуляция в навигации
                      </h4>
                      <div className="bg-white p-4 rounded border">
                        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-md cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-700">Главная</span>
                          </div>
                        </div>
                        <div className="relative flex items-center justify-between py-2 px-4 bg-gray-100 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-700">
                              {form.watch("navigationItemHref") || "/example"}
                            </span>
                          </div>
                          <BadgeIcon
                            variant={previewVariant}
                            text={previewText}
                          />
                        </div>
                        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-md cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-700">Настройки</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 text-gray-500">
                        Информация о настройке
                      </h4>
                      <div className="text-sm space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-indigo-600 font-medium">
                            URL:
                          </div>
                          <div className="text-gray-700">
                            {form.watch("navigationItemHref") || "—"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Текст:
                          </div>
                          <div className="font-medium text-gray-700">
                            {form.watch("badgeText") || "—"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Вариант:
                          </div>
                          <div className="capitalize text-gray-800">
                            {form.watch("badgeVariant") || "—"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Приоритет:
                          </div>
                          <div className="text-gray-700">
                            {form.watch("priority") || "—"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Активен:
                          </div>
                          <div
                            className={
                              form.watch("badgeEnabled")
                                ? "text-emerald-600 font-medium"
                                : "text-gray-500"
                            }
                          >
                            {form.watch("badgeEnabled") ? "Да" : "Нет"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Действует с:
                          </div>
                          <div className="text-gray-700">
                            {form.watch("validFrom")
                              ? form.watch("validFrom")?.toLocaleString()
                              : "Не указано"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Действует до:
                          </div>
                          <div className="text-gray-700">
                            {form.watch("validTo")
                              ? form.watch("validTo")?.toLocaleString()
                              : "Не указано"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Роли:
                          </div>
                          <div className="text-gray-700">
                            {form.watch("targetRoles")?.length
                              ? form.watch("targetRoles")?.join(", ")
                              : "Все"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Устройства:
                          </div>
                          <div className="text-gray-700">
                            {form.watch("targetDevices")?.length
                              ? form.watch("targetDevices")?.join(", ")
                              : "Все"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Требует авторизацию:
                          </div>
                          <div
                            className={
                              form.watch("conditions.requireAuth")
                                ? "text-emerald-600 font-medium"
                                : "text-gray-500"
                            }
                          >
                            {form.watch("conditions.requireAuth")
                              ? "Да"
                              : "Нет"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Мин. уровень:
                          </div>
                          <div className="text-gray-700">
                            {form.watch("conditions.minUserLevel") || 0}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Показать один раз:
                          </div>
                          <div
                            className={
                              form.watch("conditions.showOnlyOnce")
                                ? "text-emerald-600 font-medium"
                                : "text-gray-500"
                            }
                          >
                            {form.watch("conditions.showOnlyOnce")
                              ? "Да"
                              : "Нет"}
                          </div>

                          <div className="text-indigo-600 font-medium">
                            Скрыть после клика:
                          </div>
                          <div
                            className={
                              form.watch("conditions.hideAfterClick")
                                ? "text-emerald-600 font-medium"
                                : "text-gray-500"
                            }
                          >
                            {form.watch("conditions.hideAfterClick")
                              ? "Да"
                              : "Нет"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                {isSaving
                  ? "Сохранение..."
                  : isEditing
                    ? "Сохранить"
                    : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
