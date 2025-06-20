// utils/formValidationRules.ts
// Централизованные правила валидации

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export const VALIDATION_RULES = {
  email: [
    {
      test: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: 'Неверный формат email адреса',
      severity: 'error' as const
    },
    {
      test: (email: string) => !email.includes('..'),
      message: 'Email не может содержать двойные точки',
      severity: 'error' as const
    },
    {
      test: (email: string) => email.length <= 254,
      message: 'Email слишком длинный',
      severity: 'error' as const
    }
  ],
  
  password: [
    {
      test: (password: string) => password.length >= 8,
      message: 'Пароль должен содержать минимум 8 символов',
      severity: 'error' as const
    },
    {
      test: (password: string) => /[A-Z]/.test(password),
      message: 'Добавьте заглавные буквы (A-Z)',
      severity: 'warning' as const
    },
    {
      test: (password: string) => /[a-z]/.test(password),
      message: 'Добавьте строчные буквы (a-z)',
      severity: 'warning' as const
    },
    {
      test: (password: string) => /\d/.test(password),
      message: 'Добавьте цифры (0-9)',
      severity: 'warning' as const
    },
    {
      test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      message: 'Добавьте специальные символы (!@#$%^&*)',
      severity: 'info' as const
    }
  ],
  
  name: [
    {
      test: (name: string) => name.trim().length >= 2,
      message: 'Имя должно содержать минимум 2 символа',
      severity: 'error' as const
    },
    {
      test: (name: string) => /^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(name.trim()),
      message: 'Имя может содержать только буквы и пробелы',
      severity: 'error' as const
    },
    {
      test: (name: string) => name.trim().length <= 50,
      message: 'Имя слишком длинное',
      severity: 'error' as const
    }
  ]
};

export const validateField = (fieldName: keyof typeof VALIDATION_RULES, value: string) => {
  const rules = VALIDATION_RULES[fieldName];
  if (!rules) return { isValid: true, errors: [], warnings: [], info: [] };

  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  rules.forEach(rule => {
    if (!rule.test(value)) {
      switch (rule.severity) {
        case 'error':
          errors.push(rule.message);
          break;
        case 'warning':
          warnings.push(rule.message);
          break;
        case 'info':
          info.push(rule.message);
          break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info
  };
};
