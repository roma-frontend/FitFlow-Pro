"use client";

import React, { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorBoundary?: string;
}

// Хук для навигации в Error Boundary
function NavigationButtons({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="space-y-3">
      <Button onClick={onRetry} className="w-full">
        <RefreshCw className="h-4 w-4 mr-2" />
        Попробовать снова
      </Button>

      <Button
        variant="outline"
        onClick={handleGoHome}
        className="w-full"
      >
        <Home className="h-4 w-4 mr-2" />
        На главную страницу
      </Button>
    </div>
  );
}

class ShopErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorBoundary: error.name || "UnknownError"
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Shop Error Boundary:", error, errorInfo);

    // Отправляем ошибку на сервер с дополнительной информацией
    this.sendErrorToServer(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  sendErrorToServer = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Используем современный fetch API с улучшенной обработкой ошибок
      const response = await fetch("/api/errors/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            url: typeof window !== "undefined" ? window.location.href : "unknown",
            errorBoundary: "ShopErrorBoundary",
            nextVersion: "15.x",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (reportError) {
      console.error("Ошибка отправки отчета об ошибке:", reportError);
      
      // Fallback: сохраняем в localStorage для последующей отправки
      if (typeof window !== "undefined") {
        try {
          const errorLog = {
            error: error.message,
            timestamp: Date.now(),
            url: window.location.href,
          };
          localStorage.setItem("pendingErrorReport", JSON.stringify(errorLog));
        } catch (storageError) {
          console.error("Не удалось сохранить ошибку в localStorage:", storageError);
        }
      }
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorBoundary: undefined });
    
    // Добавляем небольшую задержку для лучшего UX
    this.retryTimeoutId = window.setTimeout(() => {
      // Принудительно обновляем компонент
      this.forceUpdate();
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100lvh] bg-gray-50 flex items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Что-то пошло не так
              </h2>

              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Произошла ошибка при загрузке магазина. Мы уже работаем над её
                устранением.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-red-800 mb-2 text-sm">
                    Детали ошибки:
                  </h4>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {"\n\nStack trace:\n"}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </div>
              )}

              <NavigationButtons onRetry={this.handleRetry} />
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ShopErrorBoundary;
