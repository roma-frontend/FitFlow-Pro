// components/admin/schedule/SchedulePage/LoadingOverlay.tsx
import React, { memo } from "react";

const LoadingOverlay = memo(function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Сохранение изменений...</span>
        </div>
      </div>
    </div>
  );
});

export default LoadingOverlay;
