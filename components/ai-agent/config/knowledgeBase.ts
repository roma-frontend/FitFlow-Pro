// config/knowledgeBase.ts
import type { Trainer, Program, Membership } from '../types';

interface TrainersMap {
  "anna-petrova": Trainer;
  "mikhail-volkov": Trainer;
  "elena-smirnova": Trainer;
  "dmitriy-kozlov": Trainer;
  "olga-ivanova": Trainer;
}

interface ProgramsMap {
  yoga: Program;
  strength: Program;
  cardio: Program;
  functional: Program;
}

interface KnowledgeBase {
  trainers: TrainersMap;
  programs: ProgramsMap;
  memberships: Membership[];
}

export const knowledgeBase: KnowledgeBase = {
  trainers: {
    "anna-petrova": {
      name: "Анна Петрова",
      specialty: "Йога и стретчинг",
      price: "от 2000₽/час",
      rating: 4.9,
      description: "Сертифицированный инструктор йоги"
    },
    "mikhail-volkov": {
      name: "Михаил Волков",
      specialty: "Силовые тренировки",
      price: "от 2500₽/час",
      rating: 4.8,
      description: "Мастер спорта по пауэрлифтингу"
    },
    "elena-smirnova": {
      name: "Елена Смирнова",
      specialty: "Кардио и похудение",
      price: "от 2200₽/час",
      rating: 5.0,
      description: "Специалист по жиросжиганию"
    },
    "dmitriy-kozlov": {
      name: "Дмитрий Козлов",
      specialty: "Функциональный тренинг",
      price: "от 2300₽/час",
      rating: 4.7,
      description: "Эксперт функционального тренинга"
    },
    "olga-ivanova": {
      name: "Ольга Иванова",
      specialty: "Групповые программы",
      price: "от 1800₽/час",
      rating: 4.9,
      description: "Тренер групповых программ"
    }
  },
  programs: {
    yoga: { name: "Йога и релакс", price: "от 800₽", description: "Гармония тела и духа" },
    strength: { name: "Силовой тренинг", price: "от 1000₽", description: "Наращивание мышечной массы" },
    cardio: { name: "Кардио и жиросжигание", price: "от 700₽", description: "Эффективное похудение" },
    functional: { name: "Функциональный тренинг", price: "от 900₽", description: "Развитие координации" }
  },
  memberships: [
    { name: "Базовый", price: 2990, description: "Идеально для начинающих" },
    { name: "Премиум", price: 4990, description: "Для активных спортсменов", popular: true },
    { name: "VIP", price: 7990, description: "Максимум возможностей" },
    { name: "Безлимит", price: 39900, description: "Годовой абонемент", discount: 25 }
  ]
};