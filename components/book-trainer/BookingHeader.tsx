// components/book-trainer/BookingHeader.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useBookingStore } from "./hooks/useBookingStore";

export function BookingHeader() {
  const { bookingStep, setBookingStep, selectedTrainer } = useBookingStore();

  const steps = [
    { key: "select", label: "Выберите тренера" },
    { key: "schedule", label: "Выберите дату и время" },
    { key: "details", label: "Детали тренировки" },
    { key: "confirm", label: "Подтверждение записи" },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === bookingStep);

  const handleBack = () => {
    if (bookingStep === "select") {
      window.history.back();
    } else {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setBookingStep(prevStep.key as any);
        if (prevStep.key === "select") {
          // Сбрасываем выбранного тренера при возврате к выбору
          // setSelectedTrainer(null);
        }
      }
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Запись к тренеру
              </h1>
              <p className="text-sm text-gray-500">
                {steps.find(step => step.key === bookingStep)?.label}
              </p>
            </div>
          </div>

          {/* Прогресс */}
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    bookingStep === step.key
                      ? "bg-blue-600 text-white"
                      : index < currentStepIndex
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      index < currentStepIndex
                        ? "bg-green-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
