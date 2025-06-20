// utils/passwordPolicies.ts
// Политики паролей для разных ролей

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minScore: number;
  description: string;
}

export const PASSWORD_POLICIES: Record<string, PasswordPolicy> = {
  member: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    minScore: 2,
    description: 'Базовые требования для участников'
  },
  staff: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minScore: 3,
    description: 'Повышенные требования для персонала'
  },
  admin: {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minScore: 4,
    description: 'Максимальные требования для администраторов'
  }
};

export const validatePasswordByRole = (
  password: string, 
  role: 'member' | 'staff' | 'admin' = 'member'
): {
  isValid: boolean;
  errors: string[];
  policy: PasswordPolicy;
} => {
  const policy = PASSWORD_POLICIES[role];
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Пароль должен содержать минимум ${policy.minLength} символов`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавные буквы');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчные буквы');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Пароль должен содержать цифры');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Пароль должен содержать специальные символы');
  }

  return {
    isValid: errors.length === 0,
    errors,
    policy
  };
};
