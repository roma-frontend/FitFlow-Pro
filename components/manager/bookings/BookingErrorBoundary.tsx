// components/manager/bookings/BookingErrorBoundary.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface BookingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class BookingErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  BookingErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): BookingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("BookingErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Произошла ошибка
            </h3>
            <p className="text-gray-600 mb-4">
              Не удалось загрузить данные о записях. Попробуйте обновить страницу.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить страницу
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default BookingErrorBoundary;
