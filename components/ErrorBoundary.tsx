// components/ErrorBoundary.tsx - Компонент для отлова ошибок
"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🔥 ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔥 ErrorBoundary componentDidCatch:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              🔥 Произошла ошибка
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Сообщение об ошибке:</h3>
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {this.state.error?.message || 'Неизвестная ошибка'}
                </p>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div>
                  <h3 className="font-medium text-gray-900">Stack Trace:</h3>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {this.state.error?.stack}
                  </pre>
                </div>
              )}
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Перезагрузить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;