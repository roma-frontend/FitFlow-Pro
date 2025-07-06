import { LucideIcon } from 'lucide-react';

export interface ActivityData {
  steps: number;
  heartRate: number;
  activeEnergy: number;
  sleepHours: number;
  lastSync: Date;
}

export interface AudioConfig {
  enabled: boolean;
  voice: "Mary" | "Peter";
}

export interface NutritionData {
  food_name: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_fat: number;
  nf_total_carbohydrate: number;
  serving_weight_grams: number;
}

export interface Link {
  title: string;
  url: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  links?: Link[];
}

export interface Trainer {
  name: string;
  specialty: string;
  price: string;
  rating: number;
  description: string;
}

export interface Program {
  name: string;
  price: string;
  description: string;
}

export interface Membership {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  discount?: number;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  color: string;
}

export interface RecoveryData {
  lastWorkout: Date | null;
  sleepHours: number;
  recoveryScore: number;
  lastMeal: Date | null;
  waterIntake: number;
  stressLevel: number;
}

export interface SleepData {
  optimalHours: string;
  bestTime: string;
  qualityTips: string[];
}

export interface StretchingProgram {
  level: 'beginner' | 'intermediate' | 'advanced';
  muscles: string[];
  exercises: Array<{
    name: string;
    duration: number;
    instructions: string;
    image?: string;
  }>;
}

export interface RecoveryAdvice {
  type: 'sleep' | 'stretching' | 'recovery';
  title: string;
  description: string;
  duration?: number;
  steps?: string[];
  tips?: string[];
}