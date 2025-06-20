// app/manager/utils/statusHelpers.ts

export const getTrainerStatusColor = (status: "active" | "busy" | "inactive" | "vacation") => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "busy":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "vacation":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getTrainerStatusText = (status: "active" | "busy" | "inactive" | "vacation") => {
  switch (status) {
    case "active":
      return "Активен";
    case "busy":
      return "Занят";
    case "inactive":
      return "Неактивен";
    case "vacation":
      return "Отпуск";
    default:
      return "Неизвестно";
  }
};

export const getBookingStatusColor = (
  status: "scheduled" | "completed" | "cancelled" | "no-show"
) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "no-show":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getBookingStatusText = (
  status: "scheduled" | "completed" | "cancelled" | "no-show"
) => {
  switch (status) {
    case "scheduled":
      return "Запланирована";
    case "completed":
      return "Завершена";
    case "cancelled":
      return "Отменена";
    case "no-show":
      return "Не явился";
    default:
      return "Неизвестно";
  }
};
