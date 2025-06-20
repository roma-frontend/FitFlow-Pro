// app/staff-login/page.tsx
import { Suspense } from "react";
import StaffLoginContent from "./StaffLoginContent";

// Компонент загрузки
function StaffLoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Загрузка...</h2>
          <p className="text-gray-600">Подготавливаем форму входа для персонала</p>
        </div>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<StaffLoginLoading />}>
      <StaffLoginContent />
    </Suspense>
  );
}
