"use client"

import * as React from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ToastItem({ toast, dismiss }: { toast: any; dismiss: (id: string) => void }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Ставим mounted в true на следующий тик, чтобы сработал transition
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Плавное появление и исчезновение
  const visible = toast.open && mounted;

  return (
    <div
      className={`
        pointer-events-auto
        w-[340px] max-w-full
        rounded-2xl shadow-2xl border-0
        bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
        text-white px-6 py-5 flex items-start gap-4
        relative overflow-hidden
        transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <div className="flex-shrink-0 mt-1">
        {toast.variant === "destructive" ? (
          <AlertTriangle className="h-6 w-6 text-yellow-300" />
        ) : (
          <CheckCircle className="h-6 w-6 text-green-300" />
        )}
      </div>
      <div className="flex-1">
        {toast.title && (
          <div className="font-bold text-lg mb-1">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm text-white/90">{toast.description}</div>
        )}
        {toast.action}
      </div>
      <button
        className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
        onClick={() => dismiss(toast.id)}
        tabIndex={0}
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col gap-4 items-end pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
      ))}
    </div>
  );
}