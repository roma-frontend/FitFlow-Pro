"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  isValidating: boolean;
}

interface ValidationSummaryProps {
  validationResults: Record<string, ValidationState>;
  showOnlyErrors?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validationResults,
  showOnlyErrors = false
}) => {
  const allErrors = Object.values(validationResults).flatMap(result => 
    result.errors || []
  );
  
  const allWarnings = Object.values(validationResults).flatMap(result => 
    result.warnings || []
  );
  
  const allInfo = Object.values(validationResults).flatMap(result => 
    result.info || []
  );

  const hasAnyIssues = allErrors.length > 0 || allWarnings.length > 0 || allInfo.length > 0;

  if (!hasAnyIssues) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Все поля заполнены корректно</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-700">Сводка валидации</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {/* Ошибки */}
        {allErrors.length > 0 && (
          <div className="space-y-1">
            {allErrors.map((error, index) => (
              <div key={index} className="flex items-center text-red-600 text-xs">
                <AlertCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Предупреждения */}
        {!showOnlyErrors && allWarnings.length > 0 && (
          <div className="space-y-1">
            {allWarnings.map((warning, index) => (
              <div key={index} className="flex items-center text-orange-600 text-xs">
                <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Информация */}
        {!showOnlyErrors && allInfo.length > 0 && (
          <div className="space-y-1">
            {allInfo.map((info, index) => (
              <div key={index} className="flex items-center text-blue-600 text-xs">
                <Info className="h-3 w-3 mr-2 flex-shrink-0" />
                <span>{info}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
