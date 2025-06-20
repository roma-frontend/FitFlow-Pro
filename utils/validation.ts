// utils/validation.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  color: 'red' | 'orange' | 'yellow' | 'green';
}

// Проверка email на реальность
export const validateEmail = async (email: string): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  // Базовая проверка формата
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Неверный формат email адреса');
    return { isValid: false, errors };
  }

  // Проверка на одноразовые email сервисы
  const disposableEmailDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'temp-mail.org',
    'throwaway.email', 'getnada.com', 'maildrop.cc'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableEmailDomains.includes(domain)) {
    errors.push('Одноразовые email адреса не разрешены');
  }

  // Проверка на популярные домены (рекомендация)
  const popularDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'mail.ru', 'yandex.ru', 'rambler.ru', 'icloud.com'
  ];

  const warnings: string[] = [];
  if (!popularDomains.includes(domain)) {
    warnings.push('Убедитесь, что email адрес введен правильно');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Проверка силы пароля
export const validatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  // Минимальная длина
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Добавьте еще ' + (8 - password.length) + ' символов');
  }

  // Строчные буквы
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте строчные буквы (a-z)');
  }

  // Заглавные буквы
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте заглавные буквы (A-Z)');
  }

  // Цифры
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте цифры (0-9)');
  }

  // Специальные символы
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте специальные символы (!@#$%^&*)');
  }

  // Проверка на общие пароли
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', '123456789', 'password1'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.unshift('Этот пароль слишком простой и часто используется');
  }

  // Проверка на повторяющиеся символы
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Избегайте повторяющихся символов');
  }

  let color: 'red' | 'orange' | 'yellow' | 'green';
  if (score <= 1) color = 'red';
  else if (score <= 2) color = 'orange';
  else if (score <= 3) color = 'yellow';
  else color = 'green';

  return { score, feedback, color };
};

// Общая валидация формы регистрации
export const validateRegistrationForm = async (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<ValidationResult> => {
  const errors: string[] = [];

  // Проверка имени
  if (!data.name.trim()) {
    errors.push('Имя обязательно для заполнения');
  } else if (data.name.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа');
  } else if (!/^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(data.name.trim())) {
    errors.push('Имя может содержать только буквы и пробелы');
  }

  // Проверка email
  const emailValidation = await validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }

  // Проверка пароля
  const passwordStrength = validatePasswordStrength(data.password);
  if (passwordStrength.score < 3) {
    errors.push('Пароль недостаточно надежный');
  }

  // Проверка совпадения паролей
  if (data.password !== data.confirmPassword) {
    errors.push('Пароли не совпадают');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Валидация формы входа
export const validateLoginForm = async (data: {
  email: string;
  password: string;
}): Promise<ValidationResult> => {
  const errors: string[] = [];

  if (!data.email.trim()) {
    errors.push('Email обязателен для заполнения');
  } else {
    const emailValidation = await validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push('Введите корректный email адрес');
    }
  }

  if (!data.password) {
    errors.push('Пароль обязателен для заполнения');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
