// utils/authValidation.ts

export const ANIMATION_CLASSES = {
  transition: {
    all: "transition-all duration-300",
    colors: "transition-colors duration-200",
    transform: "transition-transform duration-200",
  },
  hover: {
    scale: "hover:scale-105",
    lift: "hover:-translate-y-1",
    glow: "hover:shadow-lg hover:shadow-blue-500/25",
  },
  focus: {
    ring: "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    outline: "focus:outline-none",
  },
};

export const combineAnimations = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};
export interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export const validateEmailFormat = (
  email: string
): ValidationState => {
  if (!email) {
    return { isValid: false, errors: ["Email обязателен"] };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, errors: ["Неверный формат email адреса"] };
  }

  const warnings: string[] = [];

  if (email.includes("..")) {
    return {
      isValid: false,
      errors: ["Email не может содержать двойные точки"],
    };
  }

  if (email.length > 254) {
    return { isValid: false, errors: ["Email слишком длинный"] };
  }

  const [localPart, domain] = email.split("@");
  if (localPart.length > 64) {
    return {
      isValid: false,
      errors: ["Локальная часть email слишком длинная"],
    };
  }

  if (!domain || domain.length < 3) {
    return { isValid: false, errors: ["Неверный домен"] };
  }

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || tld.length > 6) {
    return { isValid: false, errors: ["Неверное доменное расширение"] };
  }

  const testDomains = ["test.com", "example.com", "localhost"];
  if (
    testDomains.some((testDomain) => domain.toLowerCase().includes(testDomain))
  ) {
    warnings.push("Используется тестовый домен");
  }

  return { isValid: true, errors: [], warnings };
};

export const validateName = (name: string): ValidationState => {
  if (!name) {
    return { isValid: false, errors: ["Имя обязательно"] };
  }

  if (name.length < 2) {
    return { isValid: false, errors: ["Имя должно содержать минимум 2 символа"] };
  }

  if (!/^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(name)) {
    return { isValid: false, errors: ["Имя должно содержать только буквы"] };
  }

  return { isValid: true, errors: [] };
};

export const validatePassword = (password: string, isLogin: boolean): ValidationState => {
  if (!password) {
    return { isValid: false, errors: ["Пароль обязателен"] };
  }

  const minLength = isLogin ? 1 : 6;
  if (password.length < minLength) {
    return {
      isValid: false,
      errors: [`Пароль должен содержать минимум ${minLength} символов`],
    };
  }

  return { isValid: true, errors: [] };
};
