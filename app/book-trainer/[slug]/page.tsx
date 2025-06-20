// app/book-trainer/[slug]/page.tsx (полная версия)
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { getTrainerBySlug } from "@/lib/trainers-data";

export default function BookTrainerPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const trainer = getTrainerBySlug(slug);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [trainingType, setTrainingType] = useState("personal");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Тренер не найден
          </h1>
          <Button onClick={() => router.push("/trainers")}>
            Вернуться к списку тренеров
          </Button>
        </Card>
      </div>
    );
  }

  const IconComponent = trainer.icon;

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const handleBooking = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Отправляем запрос на бронирование..."); // Для отладки

      const bookingData = {
        trainerId: trainer.slug,
        trainerName: trainer.name,
        date: selectedDate,
        time: selectedTime,
        type: trainingType,
        price: trainer.price,
      };

      console.log("Данные бронирования:", bookingData); // Для отладки

      const response = await fetch("/api/bookings/trainer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      console.log("Ответ сервера:", response.status, response.statusText); // Для отладки

      const data = await response.json();
      console.log("Данные ответа:", data); // Для отладки

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        console.log("Бронирование успешно создано"); // Для отладки
        setStep(4);
      } else {
        throw new Error(data.error || "Неизвестная ошибка");
      }
    } catch (error) {
      console.error("Ошибка при бронировании:", error); // Для отладки
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при бронировании"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Назад</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                Запись к тренеру
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Показываем ошибку, если есть */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Ошибка:</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Закрыть
              </button>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Тренер</span>
            <span>Дата и время</span>
            <span>Оплата</span>
            <span>Подтверждение</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная форма */}
          <div className="lg:col-span-2">
            {/* ШАГ 1: Выбор тренера и типа тренировки */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Информация о тренере
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`h-32 bg-gradient-to-br ${trainer.gradient} rounded-lg flex items-center justify-center mb-6`}
                  >
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold">{trainer.name}</h3>
                      <p className={trainer.textColor}>{trainer.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Тип тренировки
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="trainingType"
                            value="personal"
                            checked={trainingType === "personal"}
                            onChange={(e) => setTrainingType(e.target.value)}
                            className="text-blue-600"
                          />
                          <div>
                            <div className="font-medium">
                              Персональная тренировка
                            </div>
                            <div className="text-sm text-gray-600">
                              {trainer.price}
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="trainingType"
                            value="group"
                            checked={trainingType === "group"}
                            onChange={(e) => setTrainingType(e.target.value)}
                            className="text-blue-600"
                          />
                          <div>
                            <div className="font-medium">
                              Групповая тренировка
                            </div>
                            <div className="text-sm text-gray-600">
                              от 800₽/час
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      className="w-full"
                      disabled={!trainingType}
                    >
                      Выбрать дату и время
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ШАГ 2: Выбор даты и времени */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Выберите дату и время
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Дата</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 14 }, (_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + i);
                          const dateStr = date.toISOString().split("T")[0];
                          const dayName = date.toLocaleDateString("ru-RU", {
                            weekday: "short",
                          });
                          const dayNum = date.getDate();

                          return (
                            <button
                              key={dateStr}
                              onClick={() => setSelectedDate(dateStr)}
                              className={`p-2 text-center rounded-lg border transition-colors ${
                                selectedDate === dateStr
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "hover:bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="text-xs">{dayName}</div>
                              <div className="font-medium">{dayNum}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedDate && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Время
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-2 text-center rounded-lg border transition-colors ${
                                selectedTime === time
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "hover:bg-gray-50 border-gray-200"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Назад
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1"
                        disabled={!selectedDate || !selectedTime}
                      >
                        Продолжить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ШАГ 3: Оплата */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Оплата
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Детали бронирования
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Тренер: {trainer.name}</div>
                        <div>
                          Дата:{" "}
                          {new Date(selectedDate).toLocaleDateString("ru-RU")}
                        </div>
                        <div>Время: {selectedTime}</div>
                        <div>
                          Тип:{" "}
                          {trainingType === "personal"
                            ? "Персональная"
                            : "Групповая"}{" "}
                          тренировка
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Способ оплаты
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="payment"
                            defaultChecked
                            className="text-blue-600"
                          />
                          <div>Банковская карта</div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="payment"
                            className="text-blue-600"
                          />
                          <div>Оплата на месте</div>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1"
                        disabled={loading}
                      >
                        Назад
                      </Button>
                      <Button
                        onClick={handleBooking}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? "Обработка..." : "Подтвердить бронирование"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ШАГ 4: Подтверждение */}
            {step === 4 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Бронирование подтверждено!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Ваша тренировка с {trainer.name} запланирована на{" "}
                    {new Date(selectedDate).toLocaleDateString("ru-RU")} в{" "}
                    {selectedTime}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Что дальше?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Приходите за 10 минут до начала тренировки</li>
                      <li>• Возьмите с собой спортивную форму и полотенце</li>
                      <li>
                        • При необходимости можете перенести тренировку за 24
                        часа
                      </li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/member-login")}
                      className="flex-1"
                    >
                      Мои тренировки
                    </Button>
                    <Button
                      onClick={() => router.push("/trainers")}
                      className="flex-1"
                    >
                      Записаться еще
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Боковая панель с информацией */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Сводка</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${trainer.gradient} rounded-full flex items-center justify-center`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{trainer.name}</div>
                      <div className="text-sm text-gray-600">
                        {trainer.specialty}
                      </div>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(selectedDate).toLocaleDateString("ru-RU", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {selectedTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {selectedTime} -{" "}
                            {parseInt(selectedTime.split(":")[0]) + 1}:00
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {trainingType && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {trainingType === "personal"
                            ? "Персональная тренировка"
                            : "Групповая тренировка"}
                        </span>
                        <span className="font-medium">
                          {trainingType === "personal"
                            ? trainer.price
                            : "от 800₽/час"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Бесплатная отмена за 24 часа</div>
                      <div>• Возможность переноса тренировки</div>
                      <div>• Индивидуальная программа</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
