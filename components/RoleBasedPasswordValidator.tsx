// components/RoleBasedPasswordValidator.tsx
import React from 'react';
import { validatePasswordByRole } from '@/utils/passwordPolicies';
import { validatePasswordStrength } from '@/utils/validation';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface RoleBasedPasswordValidatorProps {
  password: string;
  role: 'member' | 'staff' | 'admin';
  onValidationChange: (isValid: boolean) => void;
}

export const RoleBasedPasswordValidator: React.FC<RoleBasedPasswordValidatorProps> = ({
  password,
  role,
  onValidationChange
}) => {
  const roleValidation = validatePasswordByRole(password, role);
  const strengthValidation = validatePasswordStrength(password);
  
  React.useEffect(() => {
    const isValid = roleValidation.isValid && strengthValidation.score >= roleValidation.policy.minScore;
    onValidationChange(isValid);
  }, [password, role, roleValidation.isValid, strengthValidation.score, roleValidation.policy.minScore, onValidationChange]);

  if (!password) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'staff':
        return <Shield className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'border-red-200 bg-red-50';
      case 'staff':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="mt-2 space-y-3">
      {/* Политика для роли */}
      <div className={`p-3 rounded-lg border ${getRoleColor(role)}`}>
        <div className="flex items-center space-x-2 mb-2">
          {getRoleIcon(role)}
          <span className="text-sm font-medium text-gray-700">
            Требования для роли: {role === 'admin' ? 'Администратор' : role === 'staff' ? 'Персонал' : 'Участник'}
          </span>
        </div>
        
        <div className="space-y-1">
          {roleValidation.errors.length > 0 ? (
            roleValidation.errors.map((error, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Все требования выполнены</span>
            </div>
          )}
        </div>
      </div>

      {/* Индикатор силы пароля */}
      <PasswordStrengthIndicator
        strength={strengthValidation}
        password={password}
      />

      {/* Дополнительная информация */}
      <div className="text-xs text-gray-500">
        <p>Минимальная оценка для роли "{role}": {roleValidation.policy.minScore}/5</p>
        <p>Текущая оценка: {strengthValidation.score}/5</p>
      </div>
    </div>
  );
};
