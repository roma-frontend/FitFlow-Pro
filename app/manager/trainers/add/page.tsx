// app/manager/trainers/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ManagerHeader from "@/components/manager/ManagerHeader";
import { ManagerProvider, useManager } from "@/contexts/ManagerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  DollarSign,
  ArrowLeft,
  Save,
  Upload,
  Plus,
  X,
} from "lucide-react";

function AddTrainerContent() {
  const router = useRouter();
  const { createTrainer } = useManager();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    experience: "",
    education: "",
    certifications: [] as string[],
    specialization: [] as string[],
    workingHours: {
      start: "08:00",
      end: "22:00",
      days: [] as string[],
    },
    hourlyRate: 2500,
    bio: "",
    avatar: "",
    status: "active",
  });

  const [newCertification, setNewCertification] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");

  // Доступные специализации
  const availableSpecializations = [
    "Силовые тренировки",
    "Кардио тренировки",
    "Йога",
    "Пилатес",
    "Кроссфит",
    "Бокс",
    "Стретчинг",
    "Функциональный тренинг",
    "Реабилитация",
    "Питание и диетология",
    "Групповые программы",
    "Персональные тренировки",
  ];

  // Дни недели
  const weekDays = [
    { id: "monday", label: "Понедельник" },
    { id: "tuesday", label: "Вторник" },
    { id: "wednesday", label: "Среда" },
    { id: "thursday", label: "Четверг" },
    { id: "friday", label: "Пятница" },
    { id: "saturday", label: "Суббота" },
    { id: "sunday", label: "Воскресенье" },
  ];

  const handleAddCertification = () => {
    if (
      newCertification.trim() &&
      !formData.certifications.includes(newCertification.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert),
    }));
  };

  const handleAddSpecialization = (spec: string) => {
    if (!formData.specialization.includes(spec)) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...prev.specialization, spec],
      }));
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.filter((s) => s !== spec),
    }));
  };

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        days: checked
          ? [...prev.workingHours.days, day]
          : prev.workingHours.days.filter((d) => d !== day),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTrainer(formData);
      router.push("/manager/trainers");
    } catch (error) {
      console.error("Ошибка создания тренера:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.specialization.length > 0 &&
    formData.workingHours.days.length > 0;

  return (
    <div className="min-h-[100svh] bg-gray-50">
      <ManagerHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Добавить нового тренера
            </h1>
            <p className="text-gray-600">
              Заполните информацию о новом тренере
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Основная информация */}
            <div className="lg:col-span-2 space-y-6">
              {/* Личная информация */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Личная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">ФИО *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Иванов Иван Иванович"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Дата рождения</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="trainer@example.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Телефон *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+7 (999) 123-45-67"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Адрес</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="г. Москва, ул. Примерная, д. 1"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Профессиональная информация */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Профессиональная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Опыт работы (лет)</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.experience}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            experience: e.target.value,
                          }))
                        }
                        placeholder="5"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hourlyRate">Стоимость за час (₽)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              hourlyRate: parseInt(e.target.value),
                            }))
                          }
                          placeholder="2500"
                          className="pl-10"
                          min="500"
                          step="100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="education">Образование</Label>
                    <Textarea
                      id="education"
                      value={formData.education}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          education: e.target.value,
                        }))
                      }
                      placeholder="Высшее физкультурное образование, МГУ..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Сертификаты и квалификации</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          placeholder="Добавить сертификат..."
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddCertification())
                          }
                        />
                        <Button
                          type="button"
                          onClick={handleAddCertification}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {formData.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.certifications.map((cert, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                            >
                              <span>{cert}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-blue-200"
                                onClick={() => handleRemoveCertification(cert)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Специализации *</Label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableSpecializations.map((spec) => (
                          <Button
                            key={spec}
                            type="button"
                            variant={
                              formData.specialization.includes(spec)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              formData.specialization.includes(spec)
                                ? handleRemoveSpecialization(spec)
                                : handleAddSpecialization(spec)
                            }
                            className="justify-start text-xs"
                          >
                            {spec}
                          </Button>
                        ))}
                      </div>

                      {formData.specialization.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Выбранные специализации:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.specialization.map((spec) => (
                              <div
                                key={spec}
                                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                              >
                                <span>{spec}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-green-200"
                                  onClick={() =>
                                    handleRemoveSpecialization(spec)
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Расскажите о своем подходе к тренировкам, достижениях..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Рабочее расписание */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Рабочее расписание
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Начало работы</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.workingHours.start}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              start: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">Окончание работы</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.workingHours.end}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              end: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Рабочие дни *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {weekDays.map((day) => (
                        <div
                          key={day.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={day.id}
                            checked={formData.workingHours.days.includes(
                              day.id
                            )}
                            onCheckedChange={(checked) =>
                              handleWorkingDayChange(day.id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={day.id}
                            className="text-sm font-normal"
                          >
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Фото профиля */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Фото профиля</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="Аватар"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-gray-400" />
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Загрузить фото
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-2">
                      Рекомендуемый размер: 400x400px
                      <br />
                      Форматы: JPG, PNG
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Статус */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Статус</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="inactive">Неактивен</SelectItem>
                      <SelectItem value="pending">
                        Ожидает подтверждения
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Превью */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Превью профиля</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.name && (
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formData.name}
                      </div>
                      {formData.experience && (
                        <div className="text-sm text-gray-500">
                          Опыт: {formData.experience} лет
                        </div>
                      )}
                    </div>
                  )}

                  {formData.specialization.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Специализации:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.specialization
                          .slice(0, 3)
                          .map((spec, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                        {formData.specialization.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            +{formData.specialization.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.workingHours.days.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        График:
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.workingHours.start} -{" "}
                        {formData.workingHours.end}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formData.workingHours.days.length} дней в неделю
                      </div>
                    </div>
                  )}

                  {formData.hourlyRate > 0 && (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium text-green-800">
                        Ставка:
                      </span>
                      <span className="font-bold text-green-900">
                        {formData.hourlyRate.toLocaleString()} ₽/час
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Действия */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="w-full flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Создание..." : "Создать тренера"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full"
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddTrainer() {
  return (
      <ManagerProvider>
        <AddTrainerContent />
      </ManagerProvider>
  );
}
