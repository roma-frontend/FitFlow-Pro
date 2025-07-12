// Updated types to match your implementation

import { Id } from "@/convex/_generated/dataModel";

type Exercise = {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  restTime: number;  // Changed from string to number
  muscleGroups: string[];  // Changed from targetMuscles to muscleGroups
  difficulty: 'beginner' | 'intermediate' | 'advanced';  // Added difficulty field
};

type TrainingProgram = {
  id: string;
  name: string;
  duration: number;
  sessionsPerWeek: number;
  focusAreas: string[];
  exercises: Exercise[];
};

export interface BodyMetrics {
  shoulderWidth: number;
  waistWidth: number;
  hipWidth: number;
  bodyRatio: number;
}

export interface BodyAnalysisResult {
  _id: Id<"bodyAnalysis">;
  userId: string;
  date: Date;
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph' | 'mixed';
  estimatedBodyFat: number;
  estimatedMuscleMass: number;
  posture: 'good' | 'fair' | 'poor';
  problemAreas: ProblemArea[];
  fitnessScore: number;
  progressPotential: number;
  recommendations: Recommendations;
  currentVisualData: VisualData;
  futureProjections: FutureProjections;
  bodyMetrics: BodyMetrics;
  personalizedPlan?: PersonalizedPlan;
}

export interface BodyAnalysisHookReturn {
  currentAnalysis: BodyAnalysisResult | null;
  progressCheckpoints: ProgressData | null;
  transformationLeaderboard: LeaderboardData | null;
  updateProgress: (input: ProgressUpdateInput) => Promise<ProgressData>;
  shareResults: (analysis: BodyAnalysisResult, platform: string) => Promise<void>;
  compareWithOthers: (analysis: BodyAnalysisResult) => Promise<void>;
  isProcessing: boolean;
  error: Error | null;
}

export interface ProblemArea {
  area: 'живот' | 'бедра' | 'руки' | 'спина' | 'грудь';
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface Recommendations {
  primaryGoal: string;
  secondaryGoals: string[];
  estimatedTimeToGoal: number;
  weeklyTrainingHours: number;
}

export interface VisualData {
  imageUrl: string;
  analyzedImageUrl: string;
  bodyOutlineData: any;
}

export interface FutureProjections {
  weeks4: ProjectedResult;
  weeks8: ProjectedResult;
  weeks12: ProjectedResult;
}

export interface ProjectedResult {
  visualizationUrl?: string;
  estimatedWeight: number;
  estimatedBodyFat: number;
  estimatedMuscleMass: number;
  confidenceLevel: number;
}

export interface BodyAnalysisInput {
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph' | 'mixed';
  estimatedBodyFat: number;
  estimatedMuscleMass: number;
  posture: 'good' | 'fair' | 'poor';
  fitnessScore: number;
  progressPotential: number;
  problemAreas: ProblemArea[];
  recommendations: Recommendations;
  currentVisualData: VisualData;
  futureProjections: FutureProjections;
}

export interface ProgressCheckpoint {
  _id: Id<"progressCheckpoints">;
  userId: string;
  analysisId: Id<"bodyAnalysis">;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  photoUrl: string;
  aiScore: number;
  achievements?: string[];
  comparisonWithProjection?: {
    onTrack: boolean;
    deviationPercent: number;
  };
  createdAt: number;
}

export interface ProgressUpdateInput {
  photoUrl: string;
  originalAnalysisId: Id<"bodyAnalysis">;
  newAnalysisData: BodyAnalysisInput;
  weight?: number;
}

export interface ProgressData {
  checkpoints: ProgressCheckpoint[];
  streak: number;
  nextCheckpointDate: Date;
  motivationalMessage?: string;
}

export interface TransformationLeaderboardEntry {
  _id: Id<"transformationLeaderboard">;
  userId: string;
  userName: string;
  userImageUrl?: string;
  analysisId: Id<"bodyAnalysis">;
  startWeight: number;
  currentWeight: number;
  weightLost: number;
  bodyFatLost: number;
  muscleMassGained: number;
  weeks: number;
  score: number;
  isActive: boolean;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LeaderboardData {
  leaderboard: TransformationLeaderboardEntry[];
  userRank: number;
}

export interface PersonalizedPlan {
  _id: Id<"personalizedPlans">;
  analysisId: Id<"bodyAnalysis">;
  recommendedTrainer: {
    id: string;
    name: string;
    specialty: string;
    matchScore: number;
    reason: string;
  };
  trainingProgram: TrainingProgram;
  nutritionPlan: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  recommendedProducts: RecommendedProduct[];
  membershipRecommendation: {
    type: string;
    reason: string;
    features: string[];
    price: number;
    savings: number;
  };
  projectedResults: {
    week4: string;
    week8: string;
    week12: string;
    successProbability: number;
  };
}

export interface PersonalizedPlanInput {
  analysisId: Id<"bodyAnalysis">;
  recommendedTrainer: {
    id: string;
    name: string;
    specialty: string;
    matchScore: number;
    reason: string;
  };
  trainingProgram: {
    id: string;
    name: string;
    duration: number;
    sessionsPerWeek: number;
    focusAreas: string[];
  };
  nutritionPlan: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  recommendedProducts: RecommendedProduct[];
  membershipRecommendation: {
    type: string;
    reason: string;
    features: string[];
    price: number;
    savings: number;
  };
  projectedResults: {
    week4: string;
    week8: string;
    week12: string;
    successProbability: number;
  };
}

export interface RecommendedProduct {
  productId: string;
  name: string;
  purpose: string;
  timing: string;
  monthlyBudget: number;
  importance: 'essential' | 'recommended' | 'optional';
}

export interface UserAchievement {
  _id: Id<"userAchievements">;
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  category: string;
  unlockedAt: number;
  reward?: {
    type: 'discount' | 'product' | 'session' | 'badge';
    value: string;
  };
}

export interface UserBonus {
  _id: Id<"userBonuses">;
  userId: string;
  type: 'discount' | 'product' | 'session' | 'badge';
  value: string;
  description: string;
  isUsed: boolean;
  expiresAt: number;
  createdAt: number;
}