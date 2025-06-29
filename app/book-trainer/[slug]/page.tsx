// app/book-trainer/[slug]/page.tsx
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
  Loader2,
  Bell,
  UserCircle,
  Menu,
  Settings
} from "lucide-react";
import { 
  Navigation,
  QuickActions,
  NotificationsDropdown,
  UserProfileDropdown,
  MobileMenu
} from '@/components/member/header/components';
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getTrainerBySlug } from "@/lib/trainers-data";
import { loadStripe } from "@stripe/stripe-js";
import { User as UserType } from '@/types/user';

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigation, useNotifications } from '@/components/member/header/hooks';
import { navigationItems } from '@/components/member/header/config/navigationItems';

// Инициализация Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Компонент формы оплаты
function PaymentForm({
  onSuccess,
  onError,
  bookingData
}: {
  onSuccess: (paymentIntentId: string, bookingId: string) => void;
  onError: (error: string) => void;
  bookingData: any;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    // Создаем бронирование с платежным интентом
    const createBookingWithPayment = async () => {
      try {
        const response = await fetch("/api/bookings/trainer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...bookingData,
            paymentMethod: "card",
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Ошибка создания платежа");
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setBookingId(data.booking.id);
        } else {
          throw new Error("Не получен client secret для платежа");
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
        onError(error instanceof Error ? error.message : "Ошибка создания платежа");
      }
    };

    createBookingWithPayment();
  }, [bookingData, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    // Подтверждаем платеж
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: bookingData.customerName,
          email: bookingData.memberEmail,
          phone: bookingData.customerPhone,
        },
      },
    });

    if (error) {
      console.error("Payment error:", error);
      onError(error.message || "Ошибка оплаты");
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Подтверждаем платеж на сервере
      try {
        const response = await fetch("/api/bookings/trainer/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId: bookingId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Ошибка подтверждения платежа");
        }

        onSuccess(paymentIntent.id, bookingId);
      } catch (error) {
        console.error("Error confirming payment:", error);
        onError(error instanceof Error ? error.message : "Ошибка подтверждения платежа");
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="p-4 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Информация о безопасности */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Безопасный платеж через Stripe</span>
        </div>

        <Button
          type="submit"
          disabled={!stripe || processing || !clientSecret}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Обработка платежа...
            </>
          ) : (
            `Оплатить ${bookingData.price}`
          )}
        </Button>
      </div>
    </form>
  );
}

// Основной компонент страницы - БЕЗ пропсов
export default function BookTrainerPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const trainer = getTrainerBySlug(slug);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [trainingType, setTrainingType] = useState("personal");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { handleNavigation } = useNavigation();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Состояние пользователя - управляется внутри компонента
  const [user, setUser] = useState<UserType | undefined>(undefined);

  const handleLogout = () => {
    // Логика выхода из системы
    setUser(undefined);
    localStorage.removeItem('user');
    setMobileMenuOpen(false);
    // Можете добавить редирект или другую логику
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const openMobileMenu = () => setMobileMenuOpen(true);

  // Данные пользователя
  const [userData, setUserData] = useState({
    userId: "",
    memberEmail: "",
    customerName: "",
    customerPhone: "",
  });

  // Получаем данные пользователя из сессии/контекста
  useEffect(() => {
    // Здесь должна быть логика получения данных авторизованного пользователя
    // Например, из контекста авторизации или localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Устанавливаем пользователя
      setUserData({
        userId: parsedUser.id || "",
        memberEmail: parsedUser.email || "",
        customerName: parsedUser.name || "",
        customerPhone: parsedUser.phone || "",
      });
    }
  }, []);

  if (!trainer) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
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
    "09:00", "10:00", "11:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00",
  ];

  const handlePaymentSuccess = (paymentIntentId: string, bookingId: string) => {
    console.log("Платеж успешно завершен:", paymentIntentId, "для бронирования:", bookingId);
    setStep(4);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleCashBooking = async () => {
    try {
      const response = await fetch("/api/bookings/trainer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainerId: trainer.slug,
          trainerName: trainer.name,
          date: selectedDate,
          time: selectedTime,
          type: trainingType,
          price: trainer.price,
          paymentMethod: "cash",
          ...userData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(4);
      } else {
        throw new Error(data.error || "Ошибка бронирования");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Произошла ошибка при бронировании");
    }
  };

  const bookingData = {
    trainerId: trainer.slug,
    trainerName: trainer.name,
    date: selectedDate,
    time: selectedTime,
    type: trainingType,
    price: trainer.price,
    ...userData,
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-blue-50 to-green-50">
      <>
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-blue-600/95 supports-[backdrop-filter]:via-blue-700/95 supports-[backdrop-filter]:to-green-600/95">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left side - Navigation core */}
              <div className="flex items-center space-x-4">
                {/* Главный навигационный элемент */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => router.back()}
                    className="group flex items-center rounded-lg hover:bg-white/20 transition-all duration-200"
                    aria-label="Вернуться назад"
                  >
                    <span className="text-white font-medium text-sm md:text-md px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      Назад
                    </span>
                  </button>
                  
                  <div className="h-6 w-px bg-white/20"></div>
                  
                  <div className="group hover:bg-white/20 transition-all duration-200 flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <User className="h-5 w-5 text-blue-300" />
                    <span className="text-white font-medium text-sm md:text-md hidden sm:inline">
                      Персональная запись
                    </span>
                    <span className="text-white font-medium text-sm md:text-md sm:hidden">
                      Запись
                    </span>
                  </div>
                </div>
              </div>

              {/* Остальной код без изменений */}
              <nav className="hidden lg:flex items-center space-x-1 mx-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button
                  onClick={() => handleNavigation("/member-dashboard")}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                  title="Расписание"
                >
                  <Calendar className="h-5 w-5" />
                </button>
                
                <button
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 relative"
                  title="Уведомления"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                </button>

                <UserProfileDropdown
                  user={user}
                  onNavigation={handleNavigation}
                  onLogout={handleLogout}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-white hover:bg-white/20 hover:text-white p-2 h-9 w-9 rounded-lg transition-all"
                  onClick={openMobileMenu}
                  aria-label="Открыть меню"
                >
                  <Menu className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
          navigationItems={navigationItems}
          user={user}
          onNavigation={handleNavigation}
          onLogout={handleLogout}
        />
      </>

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
            {[
              { step: 1, label: "Тренер" },
              { step: 2, label: "Дата и время" },
              { step: 3, label: "Оплата" },
              { step: 4, label: "Подтверждение" }
            ].map(({ step: stepNumber, label }) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${step >= stepNumber
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className="text-sm text-gray-600 text-center">{label}</span>
              </div>
            ))}
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

                    {/* Форма данных пользователя */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Ваши данные</h4>
                      <input
                        type="text"
                        placeholder="Ваше имя"
                        value={userData.customerName}
                        onChange={(e) => setUserData({ ...userData, customerName: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={userData.memberEmail}
                        onChange={(e) => setUserData({ ...userData, memberEmail: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Телефон"
                        value={userData.customerPhone}
                        onChange={(e) => setUserData({ ...userData, customerPhone: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 w-full"
                      disabled={!trainingType || !userData.customerName || !userData.memberEmail}
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
                              className={`p-2 text-center rounded-lg border transition-colors ${selectedDate === dateStr
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
                              className={`p-2 text-center rounded-lg border transition-colors ${selectedTime === time
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
                        <div className="font-medium text-gray-900 pt-2">
                          К оплате: {trainer.price}
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
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-blue-600"
                          />
                          <div>
                            <div className="font-medium">Банковская карта</div>
                            <div className="text-sm text-gray-600">
                              Оплата онлайн через Stripe
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="payment"
                            value="cash"
                            checked={paymentMethod === "cash"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-blue-600"
                          />
                          <div>
                            <div className="font-medium">Оплата на месте</div>
                            <div className="text-sm text-gray-600">
                              Наличными или картой в клубе
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {paymentMethod === "card" ? (
                      <Elements stripe={stripePromise}>
                        <PaymentForm
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          bookingData={bookingData}
                        />
                      </Elements>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-900 mb-2">
                            Оплата на месте
                          </h4>
                          <p className="text-sm text-yellow-800">
                            Вы сможете оплатить тренировку наличными или картой
                            непосредственно в клубе перед началом занятия.
                          </p>
                        </div>
                        <Button
                          onClick={handleCashBooking}
                          className="w-full"
                        >
                          Забронировать с оплатой на месте
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="w-full"
                    >
                      Назад
                    </Button>
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

                  {paymentMethod === "card" ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-green-900 mb-2">
                        Оплата прошла успешно
                      </h4>
                      <p className="text-sm text-green-800">
                        Квитанция отправлена на {userData.memberEmail}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        Не забудьте оплатить
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Оплатите тренировку на ресепшене перед началом занятия
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Что дальше?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                      <li>• Приходите за 10 минут до начала тренировки</li>
                      <li>• Возьмите с собой спортивную форму и полотенце</li>
                      <li>• При необходимости можете перенести тренировку за 24 часа</li>
                      <li>• Подтверждение отправлено на {userData.memberEmail}</li>
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

                  {userData.customerName && (
                    <div className="border-t pt-4">
                      <div className="text-sm space-y-1">
                        <div className="text-gray-600">Клиент:</div>
                        <div className="font-medium">{userData.customerName}</div>
                        <div className="text-gray-600">{userData.memberEmail}</div>
                        {userData.customerPhone && (
                          <div className="text-gray-600">{userData.customerPhone}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Бесплатная отмена за 24 часа</div>
                      <div>• Возможность переноса тренировки</div>
                      <div>• Индивидуальная программа</div>
                      {paymentMethod === "card" && step >= 3 && (
                        <div>• Безопасная оплата через Stripe</div>
                      )}
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