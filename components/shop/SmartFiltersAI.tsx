// components/shop/SmartFiltersAI.tsx (обновленная версия)
import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Filter, Zap, Target, Dumbbell, Users } from 'lucide-react';
import { useAIAgent } from '@/stores/useAIAgentStore';
import { useAIShopStore } from '@/stores/aiShopStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SmartFiltersAIProps {
  onGoalSelect?: (goals: string[]) => void;
  onBudgetSelect?: (budget: { min: number; max: number }) => void;
  onExperienceSelect?: (experience: string) => void;
}

export const SmartFiltersAI: React.FC<SmartFiltersAIProps> = memo(({
  onGoalSelect,
  onBudgetSelect,
  onExperienceSelect
}) => {
  const { openWithAction } = useAIAgent();
  const { setUserProfile, analyzeUserGoals } = useAIShopStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<{ min: number; max: number } | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string>('');

  const fitnessGoals = [
    { id: 'похудение', label: 'Похудение', icon: Target, color: 'from-red-500 to-pink-500' },
    { id: 'набор_массы', label: 'Набор массы', icon: Dumbbell, color: 'from-blue-500 to-indigo-500' },
    { id: 'выносливость', label: 'Выносливость', icon: Zap, color: 'from-green-500 to-emerald-500' },
    { id: 'восстановление', label: 'Восстановление', icon: Users, color: 'from-purple-500 to-violet-500' },
  ];

  const budgetRanges = [
    { min: 0, max: 1000, label: 'До 1000₽' },
    { min: 1000, max: 3000, label: '1000-3000₽' },
    { min: 3000, max: 5000, label: '3000-5000₽' },
    { min: 5000, max: 999999, label: 'Более 5000₽' },
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Новичок' },
    { id: 'intermediate', label: 'Средний' },
    { id: 'advanced', label: 'Продвинутый' },
  ];

  const handleGoalToggle = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(g => g !== goalId)
      : [...selectedGoals, goalId];
    
    setSelectedGoals(newGoals);
    onGoalSelect?.(newGoals);
  };

  const handleBudgetSelect = (budget: { min: number; max: number }) => {
    setSelectedBudget(budget);
    onBudgetSelect?.(budget);
  };

  const handleExperienceSelect = (experience: string) => {
    setSelectedExperience(experience);
    onExperienceSelect?.(experience);
  };

  const handleGetAIRecommendations = async () => {
    // Обновляем профиль пользователя
    setUserProfile({
      goals: selectedGoals,
      budget: selectedBudget || undefined,
      experience: selectedExperience || 'beginner',
    });

    // Получаем рекомендации
    if (selectedGoals.length > 0) {
      await analyzeUserGoals(selectedGoals);
    }

    // Открываем AI консультацию с рекомендациями
    openWithAction('shop_consultation', {
      page: 'shop',
      intent: 'shop_consultation',
      mode: 'recommendation',
      goals: selectedGoals,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Умный подбор товаров</h2>
        <Badge className="bg-purple-100 text-purple-700">AI-powered</Badge>
      </div>

      {/* Goals Selection */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Ваши цели:</h3>
        <div className="grid gap-3">
          {fitnessGoals.map((goal) => {
            const IconComponent = goal.icon;
            const isSelected = selectedGoals.includes(goal.id);
            
            return (
              <motion.button
                key={goal.id}
                onClick={() => handleGoalToggle(goal.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${goal.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {goal.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Budget Selection */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Бюджет:</h3>
        <div className="grid grid-cols-2 gap-2">
          {budgetRanges.map((budget, index) => (
            <button
              key={index}
              onClick={() => handleBudgetSelect(budget)}
              className={`p-3 rounded-lg border text-sm transition-colors ${
                selectedBudget?.min === budget.min && selectedBudget?.max === budget.max
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {budget.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Уровень опыта:</h3>
        <div className="flex flex-wrap gap-2">
          {experienceLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => handleExperienceSelect(level.id)}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                selectedExperience === level.id
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation Button */}
      <Button
        onClick={handleGetAIRecommendations}
        disabled={selectedGoals.length === 0}
        className="relative flex flex-wrap gap-2 h-auto w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
      >
        Получить AI-рекомендации
        {selectedGoals.length > 0 && (
          <Badge className="text-white border-white/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-transparent/65 hover:bg-transparent/80 absolute -right-2 -top-2 z-50">
            {selectedGoals.length}
          </Badge>
        )}
      </Button>
    </div>
  );
});

SmartFiltersAI.displayName = 'SmartFiltersAI';