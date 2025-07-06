"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Router } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const router = useRouter()

      return (
        <div className="min-h-[100lvh] flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Что-то пошло не так
            </h1>
            
            <p className="text-gray-600 mb-6">
              Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
            </p>
            
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Детали ошибки:</h3>
                <pre className="text-sm text-red-700 overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Перезагрузить страницу
              </Button>
              
              <Button
                onClick={() => router.push("/")}
                variant="outline"
              >
                Вернуться на главную
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
