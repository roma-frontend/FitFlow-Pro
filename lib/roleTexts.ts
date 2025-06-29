// lib/roleTexts.ts

import { UserRole } from "./permissions";

export interface RoleTexts {
  // Основные заголовки
  roleDisplayName: string;
  dashboardTitle: string;
  dashboardSubtitle: string;

  // Разделы навигации
  trainersTitle: string;
  clientsTitle: string;
  scheduleTitle: string;
  productsTitle?: string;
  reportsTitle: string;
  messagesTitle?: string,
  settingsTitle: string;
  usersTitle?: string;
  resetPasswordTitle?: string;

  productsDescription: string;
  resetPasswordDescription?: string;

  // Статистика и прогресс
  statsTitle: string;
  progressTitle: string;
  sessionsLabel: string;

  // Быстрые действия
  quickActionsTitle: string;

  // Сообщения
  successMessages: {
    dataUpdated: string;
    actionCompleted: string;
    sessionBooked: string;
    goalAchieved: string;
  };

  warningMessages: {
    offlineMode: string;
    lowPermissions: string;
    dataOutdated: string;
  };

  errorMessages: {
    loadFailed: string;
    actionFailed: string;
    connectionLost: string;
  };

  // Уведомления
  notificationTypes: {
    system: string;
    training: string;
    payment: string;
    achievement: string;
    reminder: string;
  };

  // Описания действий
  actionDescriptions: {
    create: string;
    manage: string;
    analyze: string;
    communicate: string;
  };
}

const roleTextsMap: Record<UserRole, RoleTexts> = {
  'super-admin': {
    roleDisplayName: 'Супер-администратор',
    dashboardTitle: 'Панель супер-администратора',
    dashboardSubtitle: 'Полный контроль над системой и безопасностью',

    productsDescription: 'Полное управление каталогом продуктов',
    resetPasswordDescription: 'Управление процессом восстановления паролей',


    trainersTitle: 'Управление тренерами',
    usersTitle: 'Управление сотрудниками',
    clientsTitle: 'Управление пользователями',
    scheduleTitle: 'Системное расписание',
    productsTitle: 'Управление продуктами',
    reportsTitle: 'Системная аналитика',
    messagesTitle: 'Сообщение',
    settingsTitle: 'Настройки системы',
    resetPasswordTitle: 'Сброс пароля',
    

    statsTitle: 'Системная статистика',
    progressTitle: 'Производительность системы',
    sessionsLabel: 'Активные сессии',

    quickActionsTitle: 'Системные действия',

    successMessages: {
      dataUpdated: 'Системные данные обновлены',
      actionCompleted: 'Системная операция выполнена',
      sessionBooked: 'Сессия создана',
      goalAchieved: 'Системная цель достигнута'
    },

    warningMessages: {
      offlineMode: 'Система работает в автономном режиме',
      lowPermissions: 'Ограниченные права доступа',
      dataOutdated: 'Данные устарели'
    },

    errorMessages: {
      loadFailed: 'Ошибка загрузки системных данных',
      actionFailed: 'Системная операция не выполнена',
      connectionLost: 'Потеряно соединение с сервером'
    },

    notificationTypes: {
      system: 'Системные уведомления',
      training: 'Мониторинг тренировок',
      payment: 'Финансовые операции',
      achievement: 'Системные достижения',
      reminder: 'Системные напоминания'
    },

    actionDescriptions: {
      create: 'Создание системных компонентов',
      manage: 'Управление инфраструктурой',
      analyze: 'Системная аналитика',
      communicate: 'Системные уведомления'
    }
  },

  'admin': {
    roleDisplayName: 'Администратор',
    dashboardTitle: 'Административная панель',
    dashboardSubtitle: 'Управление фитнес-центром и бизнес-процессами',
    productsDescription: 'Управление продуктами и инвентарем',
    resetPasswordDescription: 'Управление процессом восстановления паролей',

    resetPasswordTitle: 'Сброс пароля',


    trainersTitle: 'Тренерский состав',
    usersTitle: 'Управление сотрудниками',
    clientsTitle: 'База клиентов',
    scheduleTitle: 'Расписание занятий',
    messagesTitle: 'Сообщение',
    productsTitle: 'Управление продуктами',
    reportsTitle: 'Бизнес-аналитика',
    settingsTitle: 'Настройки центра',

    statsTitle: 'Бизнес-статистика',
    progressTitle: 'Финансовые показатели',
    sessionsLabel: 'Проведенные занятия',

    quickActionsTitle: 'Административные действия',

    successMessages: {
      dataUpdated: 'Данные успешно обновлены',
      actionCompleted: 'Операция выполнена успешно',
      sessionBooked: 'Занятие забронировано',
      goalAchieved: 'Цель достигнута'
    },

    warningMessages: {
      offlineMode: 'Работа в автономном режиме',
      lowPermissions: 'Недостаточно прав доступа',
      dataOutdated: 'Данные требуют обновления'
    },

    errorMessages: {
      loadFailed: 'Не удалось загрузить данные',
      actionFailed: 'Операция не выполнена',
      connectionLost: 'Соединение прервано'
    },

    notificationTypes: {
      system: 'Системные уведомления',
      training: 'Уведомления о тренировках',
      payment: 'Платежные уведомления',
      achievement: 'Достижения',
      reminder: 'Напоминания'
    },

    actionDescriptions: {
      create: 'Создание новых записей',
      manage: 'Управление ресурсами',
      analyze: 'Анализ показателей',
      communicate: 'Коммуникация с командой'
    }
  },

  'manager': {
    roleDisplayName: 'Менеджер',
    dashboardTitle: 'Панель менеджера',
    dashboardSubtitle: 'Координация работы команды и операционное управление',

    productsDescription: 'Просмотр и редактирование продуктов',

    trainersTitle: 'Команда тренеров',
    clientsTitle: 'Клиентская база',
    scheduleTitle: 'Управление расписанием',
    reportsTitle: 'Операционные отчеты',
    settingsTitle: 'Настройки залов',

    statsTitle: 'Операционная статистика',
    progressTitle: 'Эффективность команды',
    sessionsLabel: 'Занятия сегодня',

    quickActionsTitle: 'Управленческие действия',

    successMessages: {
      dataUpdated: 'Информация обновлена',
      actionCompleted: 'Задача выполнена',
      sessionBooked: 'Занятие запланировано',
      goalAchieved: 'Плановый показатель достигнут'
    },

    warningMessages: {
      offlineMode: 'Ограниченный доступ к данным',
      lowPermissions: 'Требуется подтверждение администратора',
      dataOutdated: 'Информация не актуальна'
    },

    errorMessages: {
      loadFailed: 'Ошибка загрузки расписания',
      actionFailed: 'Не удалось выполнить операцию',
      connectionLost: 'Нет связи с сервером'
    },

    notificationTypes: {
      system: 'Рабочие уведомления',
      training: 'Расписание тренировок',
      payment: 'Финансовая информация',
      achievement: 'Достижения команды',
      reminder: 'Рабочие напоминания'
    },

    actionDescriptions: {
      create: 'Планирование мероприятий',
      manage: 'Координация команды',
      analyze: 'Анализ эффективности',
      communicate: 'Взаимодействие с персоналом'
    }
  },

  'trainer': {
    roleDisplayName: 'Тренер',
    dashboardTitle: 'Рабочее место тренера',
    dashboardSubtitle: 'Управление тренировками и работа с клиентами',

    productsDescription: 'Просмотр и редактирование продуктов',

    trainersTitle: 'Коллеги-тренеры',
    clientsTitle: 'Мои клиенты',
    scheduleTitle: 'Мое расписание',
    reportsTitle: 'Отчеты по тренировкам',
    settingsTitle: 'Личные настройки',

    statsTitle: 'Статистика тренировок',
    progressTitle: 'Прогресс клиентов',
    sessionsLabel: 'Тренировки',

    quickActionsTitle: 'Действия тренера',

    successMessages: {
      dataUpdated: 'Программа обновлена',
      actionCompleted: 'Тренировка завершена',
      sessionBooked: 'Клиент записан',
      goalAchieved: 'Цель клиента достигнута'
    },

    warningMessages: {
      offlineMode: 'Синхронизация приостановлена',
      lowPermissions: 'Обратитесь к администратору',
      dataOutdated: 'Обновите программы тренировок'
    },

    errorMessages: {
      loadFailed: 'Не удалось загрузить список клиентов',
      actionFailed: 'Операция не выполнена',
      connectionLost: 'Проблемы с подключением'
    },

    notificationTypes: {
      system: 'Служебные уведомления',
      training: 'Уведомления о тренировках',
      payment: 'Информация о доходах',
      achievement: 'Достижения клиентов',
      reminder: 'Напоминания о занятиях'
    },

    actionDescriptions: {
      create: 'Создание программ тренировок',
      manage: 'Ведение клиентов',
      analyze: 'Анализ прогресса',
      communicate: 'Общение с клиентами'
    }
  },

  'member': {
    roleDisplayName: 'Участник',
    dashboardTitle: 'Личный кабинет',
    dashboardSubtitle: 'Ваши тренировки, прогресс и достижения',

    productsDescription: 'Просмотр и редактирование продуктов',

    trainersTitle: 'Наши тренеры',
    clientsTitle: 'Участники сообщества',
    scheduleTitle: 'Расписание занятий',
    reportsTitle: 'Мой прогресс',
    settingsTitle: 'Мои настройки',

    statsTitle: 'Моя статистика',
    progressTitle: 'Мой прогресс',
    sessionsLabel: 'Мои занятия',

    quickActionsTitle: 'Быстрые действия',

    successMessages: {
      dataUpdated: 'Профиль обновлен',
      actionCompleted: 'Действие выполнено',
      sessionBooked: 'Вы записаны на занятие',
      goalAchieved: 'Поздравляем! Цель достигнута'
    },

    warningMessages: {
      offlineMode: 'Некоторые функции недоступны',
      lowPermissions: 'Функция недоступна',
      dataOutdated: 'Обновите приложение'
    },

    errorMessages: {
      loadFailed: 'Не удалось загрузить расписание',
      actionFailed: 'Не удалось записаться',
      connectionLost: 'Проверьте интернет-соединение'
    },

    notificationTypes: {
      system: 'Системные сообщения',
      training: 'Уведомления о занятиях',
      payment: 'Платежные уведомления',
      achievement: 'Ваши достижения',
      reminder: 'Напоминания'
    },

    actionDescriptions: {
      create: 'Постановка целей',
      manage: 'Управление расписанием',
      analyze: 'Отслеживание прогресса',
      communicate: 'Общение в сообществе'
    }
  },

  'client': {
    roleDisplayName: 'Клиент',
    dashboardTitle: 'Персональный кабинет',
    dashboardSubtitle: 'Ваши персональные тренировки и индивидуальный прогресс',

    productsDescription: 'Просмотр и редактирование продуктов',

    trainersTitle: 'Мой тренер',
    clientsTitle: 'Другие клиенты',
    scheduleTitle: 'Мои тренировки',
    reportsTitle: 'Мои результаты',
    settingsTitle: 'Личные настройки',

    statsTitle: 'Персональная статистика',
    progressTitle: 'Мои достижения',
    sessionsLabel: 'Персональные тренировки',

    quickActionsTitle: 'Мои действия',

    successMessages: {
      dataUpdated: 'Данные сохранены',
      actionCompleted: 'Готово',
      sessionBooked: 'Тренировка запланирована',
      goalAchieved: 'Отличная работа! Цель достигнута'
    },

    warningMessages: {
      offlineMode: 'Ограниченный функционал',
      lowPermissions: 'Обратитесь к тренеру',
      dataOutdated: 'Синхронизируйте данные'
    },

    errorMessages: {
      loadFailed: 'Ошибка загрузки программы',
      actionFailed: 'Операция не выполнена',
      connectionLost: 'Нет соединения'
    },

    notificationTypes: {
      system: 'Важные сообщения',
      training: 'Уведомления о тренировках',
      payment: 'Платежная информация',
      achievement: 'Личные достижения',
      reminder: 'Персональные напоминания'
    },

    actionDescriptions: {
      create: 'Планирование целей',
      manage: 'Управление тренировками',
      analyze: 'Анализ результатов',
      communicate: 'Связь с тренером'
    }
  }
};

// Экспорт дефолтных текстов для случаев, когда роль не определена
export const defaultRoleTexts: RoleTexts = roleTextsMap.member;

// Основная функция для получения текстов роли
export function useRoleTexts(role: UserRole | undefined = undefined): RoleTexts {
  // Возвращаем тексты для роли или дефолтные тексты для 'member'
  return roleTextsMap[role || 'member'];
}

// Контекстные подсказки для каждой роли
export function getContextualHints(role: UserRole | undefined = undefined): string[] {
  if (!role) return [];

  const hintsMap: Record<UserRole, string[]> = {
    'super-admin': [
      'Регулярно проверяйте системные логи на наличие ошибок',
      'Создавайте резервные копии базы данных каждые 24 часа',
      'Мониторьте производительность серверов и нагрузку',
      'Обновляйте системы безопасности и патчи',
      'Контролируйте права доступа пользователей',
      'Анализируйте метрики использования системы',
      'Настраивайте автоматические уведомления об ошибках'
    ],

    'admin': [
      'Анализируйте финансовые показатели еженедельно',
      'Проверяйте отзывы клиентов и реагируйте на них',
      'Оценивайте эффективность маркетинговых кампаний',
      'Контролируйте загрузку залов и оптимизируйте расписание',
      'Отслеживайте показатели удержания клиентов',
      'Планируйте бюджет на следующий квартал',
      'Проводите анализ конкурентов и ценообразования'
    ],

    'manager': [
      'Проводите еженедельные встречи с командой тренеров',
      'Оптимизируйте расписание на основе популярности занятий',
      'Проверяйте состояние оборудования ежедневно',
      'Контролируйте качество обслуживания клиентов',
      'Планируйте график работы персонала',
      'Отслеживайте KPI команды и индивидуальные показатели',
      'Организуйте обучение персонала новым методикам'
    ],

    'trainer': [
      'Подготавливайте индивидуальные программы для новых клиентов',
      'Обновляйте планы тренировок каждые 4-6 недель',
      'Поддерживайте регулярную связь с клиентами',
      'Отслеживайте прогресс клиентов и корректируйте программы',
      'Изучайте новые методики тренировок',
      'Ведите дневник тренировок для каждого клиента',
      'Мотивируйте клиентов и празднуйте их достижения'
    ],

    'member': [
      'Записывайтесь на новые групповые занятия для разнообразия',
      'Отслеживайте свой прогресс в личном кабинете',
      'Попробуйте новые виды активности каждый месяц',
      'Общайтесь с другими участниками сообщества',
      'Ставьте реалистичные цели и отмечайте достижения',
      'Следите за расписанием и не пропускайте занятия',
      'Оставляйте отзывы о занятиях для улучшения сервиса'
    ],

    'client': [
      'Обсуждайте свои цели с персональным тренером',
      'Ведите дневник тренировок и питания',
      'Следите за техникой выполнения упражнений',
      'Не стесняйтесь задавать вопросы тренеру',
      'Отслеживайте прогресс и делитесь результатами',
      'Соблюдайте режим восстановления между тренировками',
      'Сообщайте тренеру о любых изменениях в самочувствии'
    ]
  };

  return hintsMap[role] || [];
}

// Получение персонализированных заголовков для уведомлений
export function getNotificationTitle(type: string = 'system', role: UserRole | undefined = undefined): string {
  if (!role) return 'Уведомление';

  const roleTexts = useRoleTexts(role);

  switch (type) {
    case 'system':
      return roleTexts.notificationTypes.system;
    case 'training':
      return roleTexts.notificationTypes.training;
    case 'payment':
      return roleTexts.notificationTypes.payment;
    case 'achievement':
      return roleTexts.notificationTypes.achievement;
    case 'reminder':
      return roleTexts.notificationTypes.reminder;
    default:
      return 'Уведомление';
  }
}

// Получение персонализированных сообщений об ошибках
export function getErrorMessage(errorType: 'load' | 'action' | 'connection' = 'load', role: UserRole | undefined = undefined): string {
  if (!role) return 'Произошла ошибка';

  const roleTexts = useRoleTexts(role);

  switch (errorType) {
    case 'load':
      return roleTexts.errorMessages.loadFailed;
    case 'action':
      return roleTexts.errorMessages.actionFailed;
    case 'connection':
      return roleTexts.errorMessages.connectionLost;
    default:
      return 'Произошла ошибка';
  }
}

// Получение персонализированных сообщений об успехе
export function getSuccessMessage(actionType: 'update' | 'complete' | 'book' | 'achieve' = 'complete', role: UserRole | undefined = undefined): string {
  if (!role) return 'Операция выполнена успешно';

  const roleTexts = useRoleTexts(role);

  switch (actionType) {
    case 'update':
      return roleTexts.successMessages.dataUpdated;
    case 'complete':
      return roleTexts.successMessages.actionCompleted;
    case 'book':
      return roleTexts.successMessages.sessionBooked;
    case 'achieve':
      return roleTexts.successMessages.goalAchieved;
    default:
      return roleTexts.successMessages.actionCompleted;
  }
}

// Получение персонализированного описания действия
export function getActionDescription(category: 'create' | 'manage' | 'analyze' | 'communicate' = 'manage', role: UserRole | undefined = undefined): string {
  if (!role) return 'Выполнение действий';

  const roleTexts = useRoleTexts(role);
  return roleTexts.actionDescriptions[category];
}

// Получение приветствия в зависимости от времени и роли
export function getPersonalizedGreeting(userName: string = 'Пользователь', role: UserRole | undefined = undefined): string {
  const hour = new Date().getHours();
  let timeGreeting = '';

  if (hour < 12) {
    timeGreeting = 'Доброе утро';
  } else if (hour < 17) {
    timeGreeting = 'Добрый день';
  } else {
    timeGreeting = 'Добрый вечер';
  }

  if (!role) {
    return `${timeGreeting}, ${userName}!`;
  }

  const roleSpecificGreetings: Record<UserRole, string> = {
    'super-admin': `${timeGreeting}, ${userName}! Все системы под вашим контролем.`,
    'admin': `${timeGreeting}, ${userName}! Готовы к продуктивному дню управления?`,
    'manager': `${timeGreeting}, ${userName}! Ваша команда ждет координации.`,
    'trainer': `${timeGreeting}, ${userName}! Готовы вдохновлять клиентов?`,
    'member': `${timeGreeting}, ${userName}! Время для новых достижений!`,
    'client': `${timeGreeting}, ${userName}! Готовы к персональной тренировке?`
  };

  return roleSpecificGreetings[role];
}

// Получение мотивационных сообщений для каждой роли
export function getMotivationalMessage(role: UserRole | undefined = undefined): string {
  if (!role) return 'Продолжайте двигаться к своим целям!';

  const motivationalMessages: Record<UserRole, string[]> = {
    'super-admin': [
      'Ваш контроль обеспечивает стабильность всей системы!',
      'Безопасность и производительность - в ваших руках!',
      'Каждое ваше решение влияет на работу всего центра!'
    ],
    'admin': [
      'Ваше управление создает успешный бизнес!',
      'Каждый довольный клиент - результат вашей работы!',
      'Эффективность центра зависит от ваших решений!'
    ],
    'manager': [
      'Ваша координация делает команду сильнее!',
      'Отличное управление создает отличные результаты!',
      'Команда достигает целей благодаря вашему руководству!'
    ],
    'trainer': [
      'Вы меняете жизни людей к лучшему!',
      'Каждая тренировка - шаг к здоровью ваших клиентов!',
      'Ваша экспертиза помогает достигать невозможного!'
    ],
    'member': [
      'Каждое занятие приближает вас к цели!',
      'Ваша настойчивость вдохновляет других!',
      'Здоровый образ жизни - лучшая инвестиция!'
    ],
    'client': [
      'Ваша целеустремленность достойна восхищения!',
      'Персональный подход дает персональные результаты!',
      'Каждая тренировка - инвестиция в ваше будущее!'
    ]
  };

  const messages = motivationalMessages[role];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Получение статистических меток для каждой роли
export function getStatsLabels(role: UserRole | undefined = undefined) {
  if (!role) {
    return {
      primary: 'Активность',
      secondary: 'Прогресс',
      tertiary: 'Достижения'
    };
  }

  const statsLabels: Record<UserRole, { primary: string; secondary: string; tertiary: string }> = {
    'super-admin': {
      primary: 'Время работы системы',
      secondary: 'Активные пользователи',
      tertiary: 'Производительность'
    },
    'admin': {
      primary: 'Выручка',
      secondary: 'Активные клиенты',
      tertiary: 'Конверсия'
    },
    'manager': {
      primary: 'Загрузка залов',
      secondary: 'Эффективность команды',
      tertiary: 'Удовлетворенность клиентов'
    },
    'trainer': {
      primary: 'Количество клиентов',
      secondary: 'Проведенные тренировки',
      tertiary: 'Средний рейтинг'
    },
    'member': {
      primary: 'Посещенные занятия',
      secondary: 'Прогресс к цели',
      tertiary: 'Достижения'
    },
    'client': {
      primary: 'Персональные тренировки',
      secondary: 'Прогресс к цели',
      tertiary: 'Личные рекорды'
    }
  };

  return statsLabels[role];
}

// Проверка доступности функции для роли
export function isFeatureAvailable(feature: string, role: UserRole | undefined = undefined): boolean {
  if (!role) return false;

  const featureAccess: Record<UserRole, string[]> = {
    'super-admin': ['all'], // Доступ ко всем функциям
    'admin': ['analytics', 'financial', 'user-management', 'reports', 'settings'],
    'manager': ['scheduling', 'team-management', 'equipment', 'basic-reports'],
    'trainer': ['client-management', 'training-programs', 'schedule', 'progress-tracking'],
    'member': ['group-classes', 'community', 'personal-stats', 'booking'],
    'client': ['personal-training', 'progress-tracking', 'goals', 'trainer-communication']
  };

  const userFeatures = featureAccess[role];
  return userFeatures.includes('all') || userFeatures.includes(feature);
}

// Получение цветовой схемы для роли
export function getRoleColorScheme(role: UserRole | undefined = undefined) {
  if (!role) {
    return {
      primary: 'blue',
      secondary: 'gray',
      accent: 'indigo'
    };
  }

  const colorSchemes: Record<UserRole, { primary: string; secondary: string; accent: string }> = {
    'super-admin': {
      primary: 'red',
      secondary: 'gray',
      accent: 'purple'
    },
    'admin': {
      primary: 'purple',
      secondary: 'blue',
      accent: 'indigo'
    },
    'manager': {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'teal'
    },
    'trainer': {
      primary: 'green',
      secondary: 'emerald',
      accent: 'lime'
    },
    'member': {
      primary: 'orange',
      secondary: 'yellow',
      accent: 'amber'
    },
    'client': {
      primary: 'pink',
      secondary: 'rose',
      accent: 'fuchsia'
    }
  };

  return colorSchemes[role];
}

// Получение иконки для роли
export function getRoleIcon(role: UserRole | undefined = undefined): string {
  if (!role) return 'User';

  const roleIcons: Record<UserRole, string> = {
    'super-admin': 'Shield',
    'admin': 'Settings',
    'manager': 'Users',
    'trainer': 'Dumbbell',
    'member': 'Activity',
    'client': 'Target'
  };

  return roleIcons[role];
}

// Получение приоритетных действий для роли
export function getPriorityActions(role: UserRole | undefined = undefined): string[] {
  if (!role) return [];

  const priorityActions: Record<UserRole, string[]> = {
    'super-admin': [
      'system-monitoring',
      'security-audit',
      'backup-management',
      'user-permissions',
      'performance-optimization'
    ],
    'admin': [
      'financial-reports',
      'client-retention',
      'staff-management',
      'marketing-analysis',
      'business-planning'
    ],
    'manager': [
      'schedule-optimization',
      'team-coordination',
      'equipment-maintenance',
      'client-satisfaction',
      'operational-efficiency'
    ],
    'trainer': [
      'client-programs',
      'session-planning',
      'progress-tracking',
      'client-communication',
      'skill-development'
    ],
    'member': [
      'class-booking',
      'goal-setting',
      'progress-tracking',
      'community-engagement',
      'health-monitoring'
    ],
    'client': [
      'personal-training',
      'goal-achievement',
      'progress-review',
      'trainer-communication',
      'lifestyle-planning'
    ]
  };

  return priorityActions[role] || [];
}

// Получение рекомендаций для роли
export function getRoleRecommendations(role: UserRole | undefined = undefined): Array<{
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}> {
  if (!role) return [];

  const recommendations: Record<UserRole, Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>> = {
    'super-admin': [
      {
        title: 'Проверьте системные логи',
        description: 'Обнаружены необычные активности в системе',
        priority: 'high',
        category: 'security'
      },
      {
        title: 'Обновите резервные копии',
        description: 'Последняя копия создана 2 дня назад',
        priority: 'medium',
        category: 'backup'
      },
      {
        title: 'Оптимизируйте производительность',
        description: 'Время отклика сервера увеличилось на 15%',
        priority: 'medium',
        category: 'performance'
      }
    ],
    'admin': [
      {
        title: 'Проанализируйте финансовые показатели',
        description: 'Готов отчет за текущий месяц',
        priority: 'high',
        category: 'finance'
      },
      {
        title: 'Обработайте отзывы клиентов',
        description: '5 новых отзывов требуют внимания',
        priority: 'medium',
        category: 'customer-service'
      },
      {
        title: 'Планируйте маркетинговую кампанию',
        description: 'Подготовка к новому сезону',
        priority: 'low',
        category: 'marketing'
      }
    ],
    'manager': [
      {
        title: 'Оптимизируйте расписание',
        description: 'Зал №2 недозагружен в утренние часы',
        priority: 'high',
        category: 'scheduling'
      },
      {
        title: 'Проведите встречу с командой',
        description: 'Еженедельная планерка просрочена',
        priority: 'medium',
        category: 'team'
      },
      {
        title: 'Проверьте оборудование',
        description: 'Плановая проверка тренажеров',
        priority: 'medium',
        category: 'equipment'
      }
    ],
    'trainer': [
      {
        title: 'Обновите программы тренировок',
        description: '3 клиента готовы к новому этапу',
        priority: 'high',
        category: 'training'
      },
      {
        title: 'Свяжитесь с клиентами',
        description: '2 клиента пропустили занятия',
        priority: 'medium',
        category: 'communication'
      },
      {
        title: 'Изучите новые методики',
        description: 'Доступен курс по функциональному тренингу',
        priority: 'low',
        category: 'education'
      }
    ],
    'member': [
      {
        title: 'Запишитесь на новое занятие',
        description: 'Доступна йога для начинающих',
        priority: 'medium',
        category: 'booking'
      },
      {
        title: 'Обновите свои цели',
        description: 'Прошлая цель достигнута на 80%',
        priority: 'medium',
        category: 'goals'
      },
      {
        title: 'Попробуйте групповую тренировку',
        description: 'Новый формат HIIT уже доступен',
        priority: 'low',
        category: 'variety'
      }
    ],
    'client': [
      {
        title: 'Обсудите прогресс с тренером',
        description: 'Время для промежуточной оценки',
        priority: 'high',
        category: 'progress'
      },
      {
        title: 'Запланируйте следующую тренировку',
        description: 'Доступны слоты на следующей неделе',
        priority: 'medium',
        category: 'scheduling'
      },
      {
        title: 'Ведите дневник тренировок',
        description: 'Отслеживайте свои ощущения и результаты',
        priority: 'low',
        category: 'tracking'
      }
    ]
  };

  return recommendations[role] || [];
}

// Получение настроек уведомлений по умолчанию для роли
export function getDefaultNotificationSettings(role: UserRole | undefined = undefined) {
  if (!role) {
    return {
      system: true,
      training: true,
      payment: false,
      achievement: true,
      reminder: true
    };
  }

  const defaultSettings: Record<UserRole, {
    system: boolean;
    training: boolean;
    payment: boolean;
    achievement: boolean;
    reminder: boolean;
  }> = {
    'super-admin': {
      system: true,
      training: false,
      payment: true,
      achievement: false,
      reminder: true
    },
    'admin': {
      system: true,
      training: true,
      payment: true,
      achievement: true,
      reminder: true
    },
    'manager': {
      system: true,
      training: true,
      payment: false,
      achievement: true,
      reminder: true
    },
    'trainer': {
      system: false,
      training: true,
      payment: true,
      achievement: true,
      reminder: true
    },
    'member': {
      system: false,
      training: true,
      payment: true,
      achievement: true,
      reminder: true
    },
    'client': {
      system: false,
      training: true,
      payment: true,
      achievement: true,
      reminder: true
    }
  };

  return defaultSettings[role];
}

// Получение метрик производительности для роли
export function getPerformanceMetrics(role: UserRole | undefined = undefined): Array<{
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  importance: 'high' | 'medium' | 'low';
}> {
  if (!role) return [];

  const metrics: Record<UserRole, Array<{
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    importance: 'high' | 'medium' | 'low';
  }>> = {
    'super-admin': [
      { name: 'Время работы системы', value: 99.8, unit: '%', trend: 'stable', importance: 'high' },
      { name: 'Активные пользователи', value: 1247, unit: 'чел', trend: 'up', importance: 'high' },
      { name: 'Использование ресурсов', value: 67, unit: '%', trend: 'stable', importance: 'medium' },
      { name: 'Время отклика', value: 145, unit: 'мс', trend: 'down', importance: 'medium' }
    ],
    'admin': [
      { name: 'Месячная выручка', value: 847230, unit: '₽', trend: 'up', importance: 'high' },
      { name: 'Новые клиенты', value: 23, unit: 'чел', trend: 'up', importance: 'high' },
      { name: 'Удержание клиентов', value: 87, unit: '%', trend: 'stable', importance: 'high' },
      { name: 'Средний чек', value: 4500, unit: '₽', trend: 'up', importance: 'medium' }
    ],
    'manager': [
      { name: 'Загрузка залов', value: 78, unit: '%', trend: 'up', importance: 'high' },
      { name: 'Эффективность команды', value: 92, unit: '%', trend: 'stable', importance: 'high' },
      { name: 'Удовлетворенность клиентов', value: 4.6, unit: '/5', trend: 'up', importance: 'high' },
      { name: 'Время простоя оборудования', value: 2.3, unit: 'ч', trend: 'down', importance: 'medium' }
    ],
    'trainer': [
      { name: 'Количество клиентов', value: 15, unit: 'чел', trend: 'up', importance: 'high' },
      { name: 'Проведенные тренировки', value: 28, unit: 'шт', trend: 'stable', importance: 'high' },
      { name: 'Средний рейтинг', value: 4.8, unit: '/5', trend: 'up', importance: 'high' },
      { name: 'Доход за месяц', value: 67500, unit: '₽', trend: 'up', importance: 'medium' }
    ],
    'member': [
      { name: 'Посещенные занятия', value: 12, unit: 'шт', trend: 'up', importance: 'high' },
      { name: 'Прогресс к цели', value: 75, unit: '%', trend: 'up', importance: 'high' },
      { name: 'Достижения', value: 5, unit: 'шт', trend: 'up', importance: 'medium' },
      { name: 'Активные дни', value: 18, unit: 'дн', trend: 'stable', importance: 'medium' }
    ],
    'client': [
      { name: 'Персональные тренировки', value: 8, unit: 'шт', trend: 'stable', importance: 'high' },
      { name: 'Прогресс к цели', value: 82, unit: '%', trend: 'up', importance: 'high' },
      { name: 'Личные рекорды', value: 3, unit: 'шт', trend: 'up', importance: 'high' },
      { name: 'Консистентность', value: 94, unit: '%', trend: 'up', importance: 'medium' }
    ]
  };

  return metrics[role] || [];
}


