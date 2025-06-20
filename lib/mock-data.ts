// lib/mock-data.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'trainer' | 'client';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface WorkingHours {
  monday: { start: string; end: string; isWorking: boolean };
  tuesday: { start: string; end: string; isWorking: boolean };
  wednesday: { start: string; end: string; isWorking: boolean };
  thursday: { start: string; end: string; isWorking: boolean };
  friday: { start: string; end: string; isWorking: boolean };
  saturday: { start: string; end: string; isWorking: boolean };
  sunday: { start: string; end: string; isWorking: boolean };
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  phone: string;
  specialization: string[];
  experience: number;
  rating: number;
  activeClients: number;
  totalSessions: number;
  hourlyRate: number;
  certifications: string[];
  workingHours: WorkingHours;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  bio?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted' | 'trial';
  trainerId?: string;
  membershipType: 'basic' | 'premium' | 'vip';
  joinDate: string;
  totalSessions: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  birthDate?: string;
  medicalInfo?: string;
  emergencyContact?: string;
  goals?: string[];
  notes?: string;
}

export interface Session {
  id: string;
  trainerId: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'personal' | 'group' | 'consultation';
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  trainerId: string;
  clientId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'training' | 'consultation' | 'group';
  location: string;
  notes: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

// Дефолтные рабочие часы
const defaultWorkingHours: WorkingHours = {
  monday: { start: '09:00', end: '18:00', isWorking: true },
  tuesday: { start: '09:00', end: '18:00', isWorking: true },
  wednesday: { start: '09:00', end: '18:00', isWorking: true },
  thursday: { start: '09:00', end: '18:00', isWorking: true },
  friday: { start: '09:00', end: '18:00', isWorking: true },
  saturday: { start: '10:00', end: '16:00', isWorking: true },
  sunday: { start: '10:00', end: '16:00', isWorking: false }
};

// Мок данные пользователей
export const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'Администратор',
    email: 'admin@gym.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user_2',
    name: 'Менеджер Иван',
    email: 'manager@gym.com',
    role: 'manager',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-15T09:15:00Z'
  },
  {
    id: 'user_3',
    name: 'Тренер Алексей',
    email: 'trainer1@gym.com',
    role: 'trainer',
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-01-15T08:45:00Z'
  },
  {
    id: 'user_4',
    name: 'Клиент Мария',
    email: 'client1@gym.com',
    role: 'client',
    status: 'active',
    createdAt: '2024-01-04T00:00:00Z',
    lastLogin: '2024-01-14T19:20:00Z'
  }
];

// Мок данные тренеров
export const mockTrainers: Trainer[] = [
  {
    id: 'trainer_1',
    name: 'Алексей Петров',
    email: 'alexey@gym.com',
    role: 'trainer',
    status: 'active',
    phone: '+7 (999) 123-45-67',
    specialization: ['Силовые тренировки', 'Кроссфит', 'Функциональный тренинг'],
    experience: 5,
    rating: 4.8,
    activeClients: 15,
    totalSessions: 450,
    hourlyRate: 2000,
    certifications: ['ACSM Certified Personal Trainer', 'CrossFit Level 2'],
    workingHours: {
      monday: { start: '08:00', end: '20:00', isWorking: true },
      tuesday: { start: '08:00', end: '20:00', isWorking: true },
      wednesday: { start: '08:00', end: '20:00', isWorking: true },
      thursday: { start: '08:00', end: '20:00', isWorking: true },
      friday: { start: '08:00', end: '18:00', isWorking: true },
      saturday: { start: '10:00', end: '16:00', isWorking: true },
      sunday: { start: '10:00', end: '16:00', isWorking: false }
    },
    createdAt: '2024-01-03T00:00:00Z',
    createdBy: 'user_1'
  },
  {
    id: 'trainer_2',
    name: 'Мария Иванова',
    email: 'maria@gym.com',
    role: 'trainer',
    status: 'active',
    phone: '+7 (999) 234-56-78',
    specialization: ['Йога', 'Пилатес', 'Растяжка'],
    experience: 3,
    rating: 4.9,
    activeClients: 20,
    totalSessions: 380,
    hourlyRate: 1800,
    certifications: ['RYT 200 Yoga Alliance', 'Pilates Method Alliance'],
    workingHours: {
      monday: { start: '09:00', end: '19:00', isWorking: true },
      tuesday: { start: '09:00', end: '19:00', isWorking: true },
      wednesday: { start: '09:00', end: '19:00', isWorking: true },
      thursday: { start: '09:00', end: '19:00', isWorking: true },
      friday: { start: '09:00', end: '17:00', isWorking: true },
      saturday: { start: '11:00', end: '15:00', isWorking: true },
      sunday: { start: '11:00', end: '15:00', isWorking: true }
    },
    createdAt: '2024-01-05T00:00:00Z',
    createdBy: 'user_2'
  },
  {
    id: 'trainer_3',
    name: 'Дмитрий Сидоров',
    email: 'dmitry@gym.com',
    role: 'trainer',
    status: 'active',
    phone: '+7 (999) 345-67-89',
    specialization: ['Бокс', 'Кикбоксинг', 'Самооборона'],
    experience: 7,
    rating: 4.7,
    activeClients: 12,
    totalSessions: 520,
    hourlyRate: 2200,
    certifications: ['Boxing Coach Level 3', 'Kickboxing Instructor'],
    workingHours: {
      monday: { start: '07:00', end: '19:00', isWorking: true },
      tuesday: { start: '07:00', end: '19:00', isWorking: true },
      wednesday: { start: '07:00', end: '19:00', isWorking: true },
      thursday: { start: '07:00', end: '19:00', isWorking: true },
      friday: { start: '07:00', end: '17:00', isWorking: true },
      saturday: { start: '09:00', end: '15:00', isWorking: true },
      sunday: { start: '09:00', end: '15:00', isWorking: false }
    },
    createdAt: '2024-01-07T00:00:00Z',
    createdBy: 'user_2'
  },
  {
    id: 'trainer_4',
    name: 'Елена Козлова',
    email: 'elena@gym.com',
    role: 'trainer',
    status: 'inactive',
    phone: '+7 (999) 456-78-90',
    specialization: ['Аэробика', 'Зумба', 'Танцы'],
    experience: 4,
    rating: 4.6,
    activeClients: 0,
    totalSessions: 290,
    hourlyRate: 1600,
    certifications: ['Aerobics Instructor', 'Zumba Basic 1'],
    workingHours: defaultWorkingHours,
    createdAt: '2024-01-10T00:00:00Z',
    createdBy: 'user_2'
  }
];

// Мок данные клиентов
export const mockClients: Client[] = [
  {
    id: 'client_1',
    name: 'Анна Иванова',
    email: 'anna.ivanova@example.com',
    phone: '+7 (999) 123-45-67',
    status: 'active',
    trainerId: 'trainer_1',
    membershipType: 'premium',
    joinDate: '2024-01-15',
    totalSessions: 25,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin_1',
    updatedBy: 'admin_1',
    birthDate: '1990-05-15',
    goals: ['Похудение', 'Укрепление мышц']
  },
  {
    id: 'client_2',
    name: 'Петр Сидоров',
    email: 'petr.sidorov@example.com',
    phone: '+7 (999) 234-56-78',
    status: 'active',
    trainerId: 'trainer_1',
    membershipType: 'basic',
    joinDate: '2024-02-01',
    totalSessions: 12,
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
    createdBy: 'trainer_1',
    updatedBy: 'trainer_1',
    birthDate: '1985-08-22',
    goals: ['Набор мышечной массы']
  },
  {
    id: 'client_3',
    name: 'Мария Козлова',
    email: 'maria.kozlova@example.com',
    phone: '+7 (999) 345-67-89',
    status: 'inactive',
    trainerId: 'trainer_2',
    membershipType: 'vip',
    joinDate: '2023-12-10',
    totalSessions: 45,
    createdAt: '2023-12-10T09:15:00Z',
    updatedAt: '2024-03-01T16:20:00Z',
    createdBy: 'admin_1',
    updatedBy: 'trainer_2',
    birthDate: '1992-03-08',
    goals: ['Общая физическая подготовка', 'Гибкость']
  },
  {
    id: 'client_4',
    name: 'Алексей Морозов',
    email: 'alexey.morozov@example.com',
    phone: '+7 (999) 456-78-90',
    status: 'suspended',
    membershipType: 'basic',
    joinDate: '2024-03-05',
    totalSessions: 3,
    createdAt: '2024-03-05T11:45:00Z',
    updatedAt: '2024-03-20T13:10:00Z',
    createdBy: 'admin_1',
    updatedBy: 'admin_1',
    birthDate: '1988-11-30',
    goals: ['Реабилитация после травмы']
  },
  {
    id: 'client_5',
    name: 'Елена Волкова',
    email: 'elena.volkova@example.com',
    phone: '+7 (999) 567-89-01',
    status: 'active',
    trainerId: 'trainer_3',
    membershipType: 'premium',
    joinDate: '2024-01-20',
    totalSessions: 18,
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-20T08:30:00Z',
    createdBy: 'trainer_3',
    updatedBy: 'trainer_3',
    birthDate: '1995-07-12',
    goals: ['Подготовка к соревнованиям', 'Выносливость']
  }
];

// Мок данные сессий
export const mockSessions: Session[] = [
  {
    id: 'session_1',
    trainerId: 'trainer_1',
    clientId: 'client_1',
    date: '2024-01-16',
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    type: 'personal',
    notes: 'Отличная тренировка, прогресс заметен',
    createdAt: '2024-01-15T00:00:00Z',
    createdBy: 'trainer_1'
  },
  {
    id: 'session_2',
    trainerId: 'trainer_2',
    clientId: 'client_2',
    date: '2024-01-17',
    startTime: '14:00',
    endTime: '15:00',
    status: 'scheduled',
    type: 'personal',
    createdAt: '2024-01-16T00:00:00Z',
    createdBy: 'trainer_2'
  },
  {
    id: 'session_3',
    trainerId: 'trainer_3',
    clientId: 'client_3',
    date: '2024-01-18',
    startTime: '16:00',
    endTime: '17:00',
    status: 'scheduled',
    type: 'personal',
    createdAt: '2024-01-17T00:00:00Z',
    createdBy: 'trainer_3'
  },
  {
    id: 'session_4',
    trainerId: 'trainer_1',
    clientId: 'client_2',
    date: '2024-03-28',
    startTime: '09:00',
    endTime: '10:00',
    status: 'scheduled',
    type: 'personal',
    notes: 'Работа над техникой приседаний',
    createdAt: '2024-03-25T00:00:00Z',
    createdBy: 'trainer_1'
  },
  {
    id: 'session_5',
    trainerId: 'trainer_2',
    clientId: 'client_1',
    date: '2024-03-29',
    startTime: '11:00',
    endTime: '12:00',
    status: 'scheduled',
    type: 'personal',
    notes: 'Йога для начинающих',
    createdAt: '2024-03-26T00:00:00Z',
    createdBy: 'trainer_2'
  },
  {
    id: 'session_6',
    trainerId: 'trainer_3',
    clientId: 'client_5',
    date: '2024-03-30',
    startTime: '18:00',
    endTime: '19:00',
    status: 'scheduled',
    type: 'personal',
    notes: 'Подготовка к соревнованиям - спарринг',
    createdAt: '2024-03-27T00:00:00Z',
    createdBy: 'trainer_3'
  }
];


export const mockEvents: Event[] = [
  {
    _id: 'event_1',
    title: 'Персональная тренировка',
    description: 'Силовая тренировка',
    startTime: '2024-05-28T10:00:00Z',
    endTime: '2024-05-28T11:00:00Z',
    trainerId: 'trainer_1',
    clientId: 'client_1',
    status: 'confirmed',
    type: 'training',
    location: 'Зал 1',
    notes: '',
    createdAt: '2024-05-27T00:00:00Z',
    createdBy: 'trainer_1',
    updatedAt: '2024-05-27T00:00:00Z'
  },
];

// Функции для работы с данными
export const getTrainerById = (id: string): Trainer | undefined => {
  return mockTrainers.find(trainer => trainer.id === id);
};

export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(client => client.id === id);
};

export const getSessionById = (id: string): Session | undefined => {
  return mockSessions.find(session => session.id === id);
};

export const getTrainerClients = (trainerId: string): Client[] => {
  return mockClients.filter(client => client.trainerId === trainerId);
};

export const getTrainerSessions = (trainerId: string): Session[] => {
  return mockSessions.filter(session => session.trainerId === trainerId);
};

export const getClientSessions = (clientId: string): Session[] => {
  return mockSessions.filter(session => session.clientId === clientId);
};

// Функция для создания дефолтных рабочих часов
export const createDefaultWorkingHours = (): WorkingHours => {
  return { ...defaultWorkingHours };
};

// Функция для валидации рабочих часов
export const validateWorkingHours = (workingHours: any): workingHours is WorkingHours => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (!workingHours || typeof workingHours !== 'object') {
    return false;
  }

  for (const day of days) {
    const daySchedule = workingHours[day];
    if (!daySchedule || typeof daySchedule !== 'object') {
      return false;
    }

    if (typeof daySchedule.start !== 'string' ||
      typeof daySchedule.end !== 'string' ||
      typeof daySchedule.isWorking !== 'boolean') {
      return false;
    }

    // Проверка формата времени (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(daySchedule.start) || !timeRegex.test(daySchedule.end)) {
      return false;
    }
  }

  return true;
};

// Функция для нормализации рабочих часов
export const normalizeWorkingHours = (workingHours: any): WorkingHours => {
  if (validateWorkingHours(workingHours)) {
    return workingHours;
  }

  console.warn('Некорректные рабочие часы, используются дефолтные значения');
  return createDefaultWorkingHours();
};

// Статистика для дашборда
export const getDashboardStats = () => {
  const activeTrainers = mockTrainers.filter(t => t.status === 'active').length;
  const activeClients = mockClients.filter(c => c.status === 'active').length;
  const todaySessions = mockSessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length;
  const totalRevenue = mockSessions
    .filter(s => s.status === 'completed')
    .reduce((sum, session) => {
      const trainer = getTrainerById(session.trainerId);
      return sum + (trainer?.hourlyRate || 0);
    }, 0);

  return {
    activeTrainers,
    activeClients,
    todaySessions,
    totalRevenue,
    totalSessions: mockSessions.length,
    completedSessions: mockSessions.filter(s => s.status === 'completed').length,
    cancelledSessions: mockSessions.filter(s => s.status === 'cancelled').length
  };
};

// Функция для поиска тренеров
export const searchTrainers = (query: string): Trainer[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockTrainers.filter(trainer =>
    trainer.name.toLowerCase().includes(lowercaseQuery) ||
    trainer.email.toLowerCase().includes(lowercaseQuery) ||
    trainer.specialization.some(spec => spec.toLowerCase().includes(lowercaseQuery))
  );
};

// Функция для поиска клиентов
export const searchClients = (query: string): Client[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockClients.filter(client =>
    client.name.toLowerCase().includes(lowercaseQuery) ||
    client.email.toLowerCase().includes(lowercaseQuery) ||
    client.phone?.includes(query)
  );
};

// Функция для получения дня недели
export const getDayOfWeek = (date: string | Date): keyof WorkingHours => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayIndex = dateObj.getDay();

  const dayMapping: { [key: number]: keyof WorkingHours } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };

  return dayMapping[dayIndex];
};

// Функция для получения локализованного названия дня
export const getLocalizedDayName = (date: string | Date, locale: string = 'ru-RU'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(dateObj);
};

// Функция для получения загруженности тренера
export const getTrainerWorkload = (trainerId: string): {
  thisWeek: number;
  thisMonth: number;
  averageRating: number;
} => {
  const trainer = getTrainerById(trainerId);
  if (!trainer) return { thisWeek: 0, thisMonth: 0, averageRating: 0 };

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const trainerSessions = getTrainerSessions(trainerId);

  const thisWeekSessions = trainerSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= weekStart && session.status === 'completed';
  }).length;

  const thisMonthSessions = trainerSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= monthStart && session.status === 'completed';
  }).length;

  return {
    thisWeek: thisWeekSessions,
    thisMonth: thisMonthSessions,
    averageRating: trainer.rating
  };
};

// Функции для обновления данных (имитация API)
export const updateTrainerInMockData = (trainerId: string, updates: Partial<Trainer>): boolean => {
  const index = mockTrainers.findIndex(t => t.id === trainerId);
  if (index === -1) return false;

  mockTrainers[index] = { ...mockTrainers[index], ...updates };
  return true;
};

export const addTrainerToMockData = (trainer: Trainer): void => {
  mockTrainers.push(trainer);
};

export const removeTrainerFromMockData = (trainerId: string): boolean => {
  const index = mockTrainers.findIndex(t => t.id === trainerId);
  if (index === -1) return false;

  mockTrainers.splice(index, 1);
  return true;
};

export const updateClientInMockData = (clientId: string, updates: Partial<Client>): boolean => {
  const index = mockClients.findIndex(c => c.id === clientId);
  if (index === -1) return false;

  mockClients[index] = { ...mockClients[index], ...updates };
  return true;
};

export const addClientToMockData = (client: Client): void => {
  mockClients.push(client);
};

export const removeClientFromMockData = (clientId: string): boolean => {
  const index = mockClients.findIndex(c => c.id === clientId);
  if (index === -1) return false;

  mockClients.splice(index, 1);
  return true;
};

export const addSessionToMockData = (session: Session): void => {
  mockSessions.push(session);
};

export const updateSessionInMockData = (sessionId: string, updates: Partial<Session>): boolean => {
  const index = mockSessions.findIndex(s => s.id === sessionId);
  if (index === -1) return false;

  mockSessions[index] = { ...mockSessions[index], ...updates };
  return true;
};

export const removeSessionFromMockData = (sessionId: string): boolean => {
  const index = mockSessions.findIndex(s => s.id === sessionId);
  if (index === -1) return false;

  mockSessions.splice(index, 1);
  return true;
};

// Экспорт всех данных для тестирования
export const mockData = {
  users: mockUsers,
  trainers: mockTrainers,
  clients: mockClients,
  sessions: mockSessions
};

// Дополнительные утилиты
export const getSessionDuration = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60); // в минутах
};

export const formatSessionTime = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Функция для получения статистики по типам сессий
export const getSessionTypeStats = () => {
  const totalSessions = mockSessions.length;
  const personal = mockSessions.filter(s => s.type === 'personal').length;
  const group = mockSessions.filter(s => s.type === 'group').length;
  const consultation = mockSessions.filter(s => s.type === 'consultation').length;

  return {
    personal: { count: personal, percentage: Math.round((personal / totalSessions) * 100) },
    group: { count: group, percentage: Math.round((group / totalSessions) * 100) },
    consultation: { count: consultation, percentage: Math.round((consultation / totalSessions) * 100) }
  };
};

// Функция для получения статистики по статусам сессий
export const getSessionStatusStats = () => {
  const totalSessions = mockSessions.length;
  const scheduled = mockSessions.filter(s => s.status === 'scheduled').length;
  const completed = mockSessions.filter(s => s.status === 'completed').length;
  const cancelled = mockSessions.filter(s => s.status === 'cancelled').length;
  const noShow = mockSessions.filter(s => s.status === 'no-show').length;

  return {
    scheduled: { count: scheduled, percentage: Math.round((scheduled / totalSessions) * 100) },
    completed: { count: completed, percentage: Math.round((completed / totalSessions) * 100) },
    cancelled: { count: cancelled, percentage: Math.round((cancelled / totalSessions) * 100) },
    noShow: { count: noShow, percentage: Math.round((noShow / totalSessions) * 100) }
  };
};

// Функция для получения топ тренеров по количеству сессий
export const getTopTrainersBySessions = (limit: number = 5) => {
  return mockTrainers
    .map(trainer => ({
      ...trainer,
      sessionCount: mockSessions.filter(s => s.trainerId === trainer.id).length
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount)
    .slice(0, limit);
};

// Функция для получения активности по дням недели
export const getWeeklyActivity = () => {
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const activity: Record<string, number> = {};

  weekDays.forEach(day => {
    activity[day] = 0;
  });

  mockSessions.forEach(session => {
    const dayOfWeek = getDayOfWeek(session.date);
    activity[dayOfWeek]++;
  });

  return activity;
};

// Функция для получения месячной статистики
export const getMonthlyStats = (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const sessionsInMonth = mockSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  const newClientsInMonth = mockClients.filter(client => {
    const joinDate = new Date(client.joinDate);
    return joinDate >= startDate && joinDate <= endDate;
  });

  const revenue = sessionsInMonth
    .filter(s => s.status === 'completed')
    .reduce((sum, session) => {
      const trainer = getTrainerById(session.trainerId);
      const duration = getSessionDuration(session.startTime, session.endTime);
      return sum + ((trainer?.hourlyRate || 0) * duration / 60);
    }, 0);

  return {
    totalSessions: sessionsInMonth.length,
    completedSessions: sessionsInMonth.filter(s => s.status === 'completed').length,
    newClients: newClientsInMonth.length,
    revenue: Math.round(revenue)
  };
};

// Функция для получения предстоящих сессий
export const getUpcomingSessions = (limit: number = 10) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  return mockSessions
    .filter(session => {
      if (session.status !== 'scheduled') return false;
      if (session.date > today) return true;
      if (session.date === today && session.startTime > currentTime) return true;
      return false;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.startTime.localeCompare(b.startTime);
      }
      return dateCompare;
    })
    .slice(0, limit)
    .map(session => ({
      ...session,
      trainerName: getTrainerById(session.trainerId)?.name || 'Неизвестный тренер',
      clientName: getClientById(session.clientId)?.name || 'Неизвестный клиент'
    }));
};

// Функция для получения просроченных сессий
export const getOverdueSessions = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  return mockSessions
    .filter(session => {
      if (session.status !== 'scheduled') return false;
      if (session.date < today) return true;
      if (session.date === today && session.endTime < currentTime) return true;
      return false;
    })
    .map(session => ({
      ...session,
      trainerName: getTrainerById(session.trainerId)?.name || 'Неизвестный тренер',
      clientName: getClientById(session.clientId)?.name || 'Неизвестный клиент'
    }));
};

// Функция для получения клиентов без назначенного тренера
export const getClientsWithoutTrainer = () => {
  return mockClients.filter(client => !client.trainerId && client.status === 'active');
};

// Функция для получения неактивных клиентов
export const getInactiveClients = (daysThreshold: number = 30) => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  return mockClients
    .filter(client => client.status === 'active')
    .filter(client => {
      const clientSessions = getClientSessions(client.id);
      const lastSession = clientSessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => b.date.localeCompare(a.date))[0];

      if (!lastSession) return true;

      const lastSessionDate = new Date(lastSession.date);
      return lastSessionDate < thresholdDate;
    })
    .map(client => {
      const clientSessions = getClientSessions(client.id);
      const lastSession = clientSessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => b.date.localeCompare(a.date))[0];

      return {
        ...client,
        lastSessionDate: lastSession?.date || null,
        daysSinceLastSession: lastSession
          ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
          : null
      };
    });
};

// Функция для получения популярных временных слотов
export const getPopularTimeSlots = () => {
  const timeSlots: Record<string, number> = {};

  mockSessions.forEach(session => {
    const hour = session.startTime.split(':')[0];
    const slot = `${hour}:00`;
    timeSlots[slot] = (timeSlots[slot] || 0) + 1;
  });

  return Object.entries(timeSlots)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => b.count - a.count);
};

// Функция для получения статистики по специализациям
export const getSpecializationStats = () => {
  const specializations: Record<string, number> = {};

  mockTrainers.forEach(trainer => {
    trainer.specialization.forEach(spec => {
      specializations[spec] = (specializations[spec] || 0) + 1;
    });
  });

  return Object.entries(specializations)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

// Функция для получения статистики по типам членства
export const getMembershipStats = () => {
  const memberships = {
    basic: mockClients.filter(c => c.membershipType === 'basic').length,
    premium: mockClients.filter(c => c.membershipType === 'premium').length,
    vip: mockClients.filter(c => c.membershipType === 'vip').length
  };

  const total = Object.values(memberships).reduce((sum, count) => sum + count, 0);

  return Object.entries(memberships).map(([type, count]) => ({
    type,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
};

// Функция для валидации данных клиента
export const validateClientData = (client: Partial<Client>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!client.name || client.name.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа');
  }

  if (!client.email || !isValidEmail(client.email)) {
    errors.push('Некорректный email адрес');
  }

  if (client.phone && !/^\+?[\d\s\-$]{10,}$/.test(client.phone)) {
    errors.push('Некорректный номер телефона');
  }

  if (client.membershipType && !['basic', 'premium', 'vip'].includes(client.membershipType)) {
    errors.push('Некорректный тип членства');
  }

  if (client.status && !['active', 'inactive', 'suspended'].includes(client.status)) {
    errors.push('Некорректный статус');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Функция для валидации данных тренера
export const validateTrainerData = (trainer: Partial<Trainer>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!trainer.name || trainer.name.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа');
  }

  if (!trainer.email || !isValidEmail(trainer.email)) {
    errors.push('Некорректный email адрес');
  }

  if (trainer.phone && !/^\+?[\d\s\-$]{10,}$/.test(trainer.phone)) {
    errors.push('Некорректный номер телефона');
  }

  if (trainer.experience !== undefined && (trainer.experience < 0 || trainer.experience > 50)) {
    errors.push('Опыт работы должен быть от 0 до 50 лет');
  }

  if (trainer.hourlyRate !== undefined && (trainer.hourlyRate < 500 || trainer.hourlyRate > 10000)) {
    errors.push('Почасовая ставка должна быть от 500 до 10000 рублей');
  }

  if (trainer.rating !== undefined && (trainer.rating < 0 || trainer.rating > 5)) {
    errors.push('Рейтинг должен быть от 0 до 5');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Функция для валидации данных сессии
export const validateSessionData = (session: Partial<Session>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!session.trainerId) {
    errors.push('Не указан тренер');
  } else if (!getTrainerById(session.trainerId)) {
    errors.push('Тренер не найден');
  }

  if (!session.clientId) {
    errors.push('Не указан клиент');
  } else if (!getClientById(session.clientId)) {
    errors.push('Клиент не найден');
  }

  if (!session.date) {
    errors.push('Не указана дата');
  } else {
    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      errors.push('Нельзя создать сессию в прошлом');
    }
  }

  if (!session.startTime || !session.endTime) {
    errors.push('Не указано время начала или окончания');
  } else {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(session.startTime) || !timeRegex.test(session.endTime)) {
      errors.push('Некорректный формат времени');
    } else {
      const start = new Date(`2000-01-01T${session.startTime}`);
      const end = new Date(`2000-01-01T${session.endTime}`);

      if (start >= end) {
        errors.push('Время начала должно быть раньше времени окончания');
      }

      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      if (duration < 30) {
        errors.push('Минимальная продолжительность сессии - 30 минут');
      }
      if (duration > 240) {
        errors.push('Максимальная продолжительность сессии - 4 часа');
      }
    }
  }

  if (session.type && !['personal', 'group', 'consultation'].includes(session.type)) {
    errors.push('Некорректный тип сессии');
  }

  if (session.status && !['scheduled', 'completed', 'cancelled', 'no-show'].includes(session.status)) {
    errors.push('Некорректный статус сессии');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Функция для получения конфликтующих сессий
export const getConflictingSessions = (
  trainerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
) => {
  return mockSessions.filter(session =>
    session.id !== excludeSessionId &&
    session.trainerId === trainerId &&
    session.date === date &&
    session.status !== 'cancelled' &&
    (
      (startTime >= session.startTime && startTime < session.endTime) ||
      (endTime > session.startTime && endTime <= session.endTime) ||
      (startTime <= session.startTime && endTime >= session.endTime)
    )
  );
};

// Функция для проверки доступности тренера
export const isTrainerAvailable = (
  trainerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
): boolean => {
  const trainer = getTrainerById(trainerId);
  if (!trainer) return false;

  // Проверяем рабочие часы
  const dayOfWeek = getDayOfWeek(date);
  const workingDay = trainer.workingHours[dayOfWeek];

  if (!workingDay.isWorking) return false;
  if (startTime < workingDay.start || endTime > workingDay.end) return false;

  // Проверяем конфликты с существующими сессиями
  const conflicts = getConflictingSessions(trainerId, date, startTime, endTime, excludeSessionId);
  return conflicts.length === 0;
};

// Функция для получения доступных слотов тренера
export const getAvailableSlots = (
  trainerId: string,
  date: string,
  duration: number = 60
): string[] => {
  const trainer = getTrainerById(trainerId);
  if (!trainer) return [];

  const dayOfWeek = getDayOfWeek(date);
  const workingDay = trainer.workingHours[dayOfWeek];

  if (!workingDay.isWorking) return [];

  const slots: string[] = [];
  const startHour = parseInt(workingDay.start.split(':')[0]);
  const startMinute = parseInt(workingDay.start.split(':')[1]);
  const endHour = parseInt(workingDay.end.split(':')[0]);
  const endMinute = parseInt(workingDay.end.split(':')[1]);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  for (let time = startTime; time + duration <= endTime; time += 30) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const endSlotTime = time + duration;
    const endSlotHour = Math.floor(endSlotTime / 60);
    const endSlotMinute = endSlotTime % 60;
    const endTimeSlot = `${endSlotHour.toString().padStart(2, '0')}:${endSlotMinute.toString().padStart(2, '0')}`;

    if (isTrainerAvailable(trainerId, date, timeSlot, endTimeSlot)) {
      slots.push(timeSlot);
    }
  }

  return slots;
};

// Функция для получения рекомендаций по улучшению
export const getRecommendations = () => {
  const recommendations: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
  }> = [];

  // Проверка неактивных клиентов
  const inactiveClients = getInactiveClients(14);
  if (inactiveClients.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Неактивные клиенты',
      description: `${inactiveClients.length} клиентов не посещали тренировки более 14 дней`,
      action: 'Свяжитесь с клиентами для возобновления тренировок'
    });
  }

  // Проверка просроченных сессий
  const overdueSessions = getOverdueSessions();
  if (overdueSessions.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Просроченные сессии',
      description: `${overdueSessions.length} сессий требуют обновления статуса`,
      action: 'Обновите статус завершенных сессий'
    });
  }

  // Проверка клиентов без тренера
  const clientsWithoutTrainer = getClientsWithoutTrainer();
  if (clientsWithoutTrainer.length > 0) {
    recommendations.push({
      type: 'info',
      title: 'Клиенты без тренера',
      description: `${clientsWithoutTrainer.length} активных клиентов не имеют назначенного тренера`,
      action: 'Назначьте тренеров для новых клиентов'
    });
  }

  // Проверка загруженности тренеров
  const underutilizedTrainers = mockTrainers.filter(trainer => {
    if (trainer.status !== 'active') return false;
    const workload = getTrainerWorkload(trainer.id);
    return workload.thisWeek < 5; // Менее 5 сессий в неделю
  });

  if (underutilizedTrainers.length > 0) {
    recommendations.push({
      type: 'info',
      title: 'Низкая загруженность тренеров',
      description: `${underutilizedTrainers.length} тренеров имеют менее 5 сессий в неделю`,
      action: 'Рассмотрите перераспределение клиентов'
    });
  }

  return recommendations;
};

// Функция для экспорта данных
export const exportToCSV = (data: any[], filename: string): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
};

// Функция для получения отчета по тренеру
export const getTrainerReport = (trainerId: string, startDate: string, endDate: string) => {
  const trainer = getTrainerById(trainerId);
  if (!trainer) return null;

  const sessions = mockSessions.filter(session =>
    session.trainerId === trainerId &&
    session.date >= startDate &&
    session.date <= endDate
  );

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
  const noShowSessions = sessions.filter(s => s.status === 'no-show');

  const totalHours = completedSessions.reduce((sum, session) => {
    return sum + getSessionDuration(session.startTime, session.endTime) / 60;
  }, 0);

  const revenue = totalHours * trainer.hourlyRate;

  const clients = getTrainerClients(trainerId);
  const activeClients = clients.filter(c => c.status === 'active');

  return {
    trainer: {
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      specialization: trainer.specialization,
      rating: trainer.rating
    },
    period: {
      startDate,
      endDate
    },
    sessions: {
      total: sessions.length,
      completed: completedSessions.length,
      cancelled: cancelledSessions.length,
      noShow: noShowSessions.length,
      completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
    },
    time: {
      totalHours: Math.round(totalHours * 10) / 10,
      averageSessionDuration: completedSessions.length > 0
        ? Math.round((totalHours / completedSessions.length) * 60)
        : 0
    },
    financial: {
      revenue: Math.round(revenue),
      averageSessionPrice: completedSessions.length > 0
        ? Math.round(revenue / completedSessions.length)
        : 0
    },
    clients: {
      total: clients.length,
      active: activeClients.length,
      retention: clients.length > 0 ? Math.round((activeClients.length / clients.length) * 100) : 0
    }
  };
};

// Функция для получения отчета по клиенту
export const getClientReport = (clientId: string, startDate: string, endDate: string) => {
  const client = getClientById(clientId);
  if (!client) return null;

  const sessions = mockSessions.filter(session =>
    session.clientId === clientId &&
    session.date >= startDate &&
    session.date <= endDate
  );

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
  const noShowSessions = sessions.filter(s => s.status === 'no-show');

  const totalHours = completedSessions.reduce((sum, session) => {
    return sum + getSessionDuration(session.startTime, session.endTime) / 60;
  }, 0);

  const trainer = client.trainerId ? getTrainerById(client.trainerId) : null;

  const totalCost = completedSessions.reduce((sum, session) => {
    const sessionTrainer = getTrainerById(session.trainerId);
    const duration = getSessionDuration(session.startTime, session.endTime) / 60;
    return sum + (sessionTrainer?.hourlyRate || 0) * duration;
  }, 0);

  return {
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      membershipType: client.membershipType,
      joinDate: client.joinDate,
      status: client.status
    },
    trainer: trainer ? {
      id: trainer.id,
      name: trainer.name,
      specialization: trainer.specialization
    } : null,
    period: {
      startDate,
      endDate
    },
    sessions: {
      total: sessions.length,
      completed: completedSessions.length,
      cancelled: cancelledSessions.length,
      noShow: noShowSessions.length,
      attendanceRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
    },
    time: {
      totalHours: Math.round(totalHours * 10) / 10,
      averageSessionDuration: completedSessions.length > 0
        ? Math.round((totalHours / completedSessions.length) * 60)
        : 0
    },
    financial: {
      totalCost: Math.round(totalCost),
      averageSessionCost: completedSessions.length > 0
        ? Math.round(totalCost / completedSessions.length)
        : 0
    }
  };
};

// Функция для получения общего отчета
export const getGeneralReport = (startDate: string, endDate: string) => {
  const sessions = mockSessions.filter(session =>
    session.date >= startDate &&
    session.date <= endDate
  );

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const newClients = mockClients.filter(client =>
    client.joinDate >= startDate &&
    client.joinDate <= endDate
  );

  const totalRevenue = completedSessions.reduce((sum, session) => {
    const trainer = getTrainerById(session.trainerId);
    const duration = getSessionDuration(session.startTime, session.endTime) / 60;
    return sum + (trainer?.hourlyRate || 0) * duration;
  }, 0);

  const activeTrainers = mockTrainers.filter(t => t.status === 'active');
  const activeClients = mockClients.filter(c => c.status === 'active');

  return {
    period: {
      startDate,
      endDate
    },
    sessions: {
      total: sessions.length,
      completed: completedSessions.length,
      cancelled: sessions.filter(s => s.status === 'cancelled').length,
      noShow: sessions.filter(s => s.status === 'no-show').length,
      completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
    },
    clients: {
      total: mockClients.length,
      active: activeClients.length,
      new: newClients.length,
      byMembership: getMembershipStats()
    },
    trainers: {
      total: mockTrainers.length,
      active: activeTrainers.length,
      averageRating: activeTrainers.length > 0
        ? Math.round((activeTrainers.reduce((sum, t) => sum + t.rating, 0) / activeTrainers.length) * 10) / 10
        : 0
    },
    financial: {
      totalRevenue: Math.round(totalRevenue),
      averageSessionPrice: completedSessions.length > 0
        ? Math.round(totalRevenue / completedSessions.length)
        : 0,
      revenuePerTrainer: activeTrainers.length > 0
        ? Math.round(totalRevenue / activeTrainers.length)
        : 0
    },
    popular: {
      timeSlots: getPopularTimeSlots().slice(0, 5),
      specializations: getSpecializationStats().slice(0, 5)
    }
  };
};



