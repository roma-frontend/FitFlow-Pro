// components/admin/settings/components/SettingsOperationSkeletons.tsx
"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle,
  Settings,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsOperationSkeletonProps {
  operation: string;
  isMobile?: boolean;
  progress?: number;
  className?: string;
}

export const SettingsOperationSkeleton = ({
  operation,
  isMobile = false,
  progress,
  className
}: SettingsOperationSkeletonProps) => {
  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={cn(
        "w-full max-w-sm mx-4 shadow-xl border-0",
        className
      )}>
        <CardContent className={cn(
          "flex flex-col items-center space-y-4 text-center",
          isMobile ? "p-6" : "p-8"
        )}>
          <div className="relative">
            <Loader2 className={cn(
              "animate-spin text-blue-600",
              isMobile ? "h-8 w-8" : "h-10 w-10"
            )} />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-gray-900",
              isMobile ? "text-base" : "text-lg"
            )}>
              {operation}
            </h3>
            
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-sm" : "text-base"
            )}>
              Пожалуйста, подождите...
            </p>
          </div>

          {progress !== undefined && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500">{progress}%</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
};

interface SpecificOperationSkeletonProps {
  isMobile?: boolean;
  className?: string;
}

export const SettingsExportSkeleton = ({ 
  isMobile = false, 
  className 
}: SpecificOperationSkeletonProps) => {
  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={cn(
        "w-full max-w-sm mx-4 shadow-xl border-0",
        className
      )}>
        <CardContent className={cn(
          "flex flex-col items-center space-y-4 text-center",
          isMobile ? "p-6" : "p-8"
        )}>
          <div className="relative">
            <Download className={cn(
              "text-green-600 animate-bounce",
              isMobile ? "h-8 w-8" : "h-10 w-10"
            )} />
            <div className="absolute -inset-2 rounded-full border-2 border-green-200 animate-ping" />
          </div>
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-gray-900",
              isMobile ? "text-base" : "text-lg"
            )}>
              Экспорт настроек
            </h3>
            
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-sm" : "text-base"
            )}>
              Подготовка файла для скачивания...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
};

export const SettingsImportSkeleton = ({ 
  isMobile = false, 
  className 
}: SpecificOperationSkeletonProps) => {
  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={cn(
        "w-full max-w-sm mx-4 shadow-xl border-0",
        className
      )}>
        <CardContent className={cn(
          "flex flex-col items-center space-y-4 text-center",
          isMobile ? "p-6" : "p-8"
        )}>
          <div className="relative">
            <Upload className={cn(
              "text-blue-600 animate-pulse",
              isMobile ? "h-8 w-8" : "h-10 w-10"
            )} />
            <div className="absolute -inset-2 rounded-full border-2 border-blue-200 animate-spin" />
          </div>
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-gray-900",
              isMobile ? "text-base" : "text-lg"
            )}>
              Импорт настроек
            </h3>
            
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-sm" : "text-base"
            )}>
              Обработка загруженного файла...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
};

export const SettingsResetSkeleton = ({ 
  isMobile = false, 
  className 
}: SpecificOperationSkeletonProps) => {
  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={cn(
        "w-full max-w-sm mx-4 shadow-xl border-0",
        className
      )}>
        <CardContent className={cn(
          "flex flex-col items-center space-y-4 text-center",
          isMobile ? "p-6" : "p-8"
        )}>
          <div className="relative">
            <RotateCcw className={cn(
              "text-orange-600 animate-spin",
              isMobile ? "h-8 w-8" : "h-10 w-10"
            )} />
            <div className="absolute -inset-2 rounded-full border-2 border-orange-200 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-gray-900",
              isMobile ? "text-base" : "text-lg"
            )}>
              Сброс настроек
            </h3>
            
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-sm" : "text-base"
            )}>
              Восстановление значений по умолчанию...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
};

export const SettingsValidationSkeleton = ({ 
  isMobile = false, 
  className 
}: SpecificOperationSkeletonProps) => {
  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={cn(
        "w-full max-w-sm mx-4 shadow-xl border-0",
        className
      )}>
        <CardContent className={cn(
          "flex flex-col items-center space-y-4 text-center",
          isMobile ? "p-6" : "p-8"
        )}>
          <div className="relative">
            <CheckCircle className={cn(
              "text-purple-600 animate-pulse",
              isMobile ? "h-8 w-8" : "h-10 w-10"
            )} />
            <div className="absolute -inset-2 rounded-full border-2 border-purple-200 animate-ping" />
          </div>
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-gray-900",
              isMobile ? "text-base" : "text-lg"
            )}>
              Проверка настроек
            </h3>
            
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-sm" : "text-base"
            )}>
              Валидация конфигурации...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
};
