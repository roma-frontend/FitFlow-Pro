// app/auth/face-auth/page.tsx - Fixed version with Suspense
"use client";

import { Suspense } from "react";
import FaceAuthContent from "./FaceAuthContent";
import { Loader2 } from "lucide-react";

// Loading component for Suspense fallback
function FaceAuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Загрузка Face ID...</p>
      </div>
    </div>
  );
}

export default function FaceAuthPage() {
  return (
    <Suspense fallback={<FaceAuthLoading />}>
      <FaceAuthContent />
    </Suspense>
  );
}