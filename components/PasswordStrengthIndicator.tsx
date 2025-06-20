// components/PasswordStrengthIndicator.tsx
import React from 'react';
import { PasswordStrength } from '@/utils/validation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  password
}) => {
  if (!password) return null;

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'Слабый';
      case 2:
        return 'Средний';
      case 3:
        return 'Хороший';
      case 4:
      case 5:
        return 'Отличный';
      default:
        return 'Слабый';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500 text-red-700 border-red-200';
      case 'orange':
        return 'bg-orange-500 text-orange-700 border-orange-200';
      case 'yellow':
        return 'bg-yellow-500 text-yellow-700 border-yellow-200';
      case 'green':
        return 'bg-green-500 text-green-700 border-green-200';
      default:
        return 'bg-gray-500 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Индикатор силы пароля */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.color === 'red' ? 'bg-red-500' :
              strength.color === 'orange' ? 'bg-orange-500' :
              strength.color === 'yellow' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          strength.color === 'red' ? 'text-red-600' :
          strength.color === 'orange' ? 'text-orange-600' :
          strength.color === 'yellow' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {getStrengthText(strength.score)}
        </span>
      </div>

      {/* Рекомендации */}
      {strength.feedback.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          strength.color === 'green' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <p className="text-sm font-medium text-gray-700 mb-1">
            {strength.color === 'green' ? '✅ Отличный пароль!' : '💡 Рекомендации:'}
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            {strength.feedback.map((item, index) => (
              <li key={index} className="flex items-center space-x-1">
                <span className="text-gray-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
