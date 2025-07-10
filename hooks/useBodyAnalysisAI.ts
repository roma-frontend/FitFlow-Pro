// hooks/useBodyAnalysisAI.ts
import { useCallback } from 'react';
import { useAIAgent } from '@/stores/useAIAgentStore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/stores/cartStore';
import type { BodyAnalysisResult, PersonalizedPlan } from '@/types/bodyAnalysis';

export const useBodyAnalysisAI = () => {
  const { openWithAction } = useAIAgent();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCartStore();

  // Открыть консультацию по результатам анализа
  const openAnalysisConsultation = useCallback((
    analysis: BodyAnalysisResult,
    plan: PersonalizedPlan
  ) => {
    openWithAction('body_analysis_consultation', {
      page: 'body-analysis',
      intent: 'transformation_plan',
      analysisResult: analysis,
      personalizedPlan: plan,
      bodyType: analysis.bodyType,
      goals: [analysis.recommendations.primaryGoal, ...analysis.recommendations.secondaryGoals],
      currentMetrics: {
        bodyFat: analysis.estimatedBodyFat,
        muscleMass: analysis.estimatedMuscleMass,
        fitnessScore: analysis.fitnessScore
      },
      projectedResults: analysis.futureProjections
    });
  }, [openWithAction]);

  // Запросить корректировку плана
  const requestPlanAdjustment = useCallback((
    analysisId: string,
    concerns: string[]
  ) => {
    openWithAction('plan_adjustment', {
      analysisId,
      concerns,
      intent: 'modify_plan'
    });
  }, [openWithAction]);

  // Начать программу трансформации
  const startTransformation = useCallback(async (
    plan: PersonalizedPlan
  ) => {
    try {
      // 1. Записываем к тренеру
      const trainerBooking = await bookTrainer(plan.recommendedTrainer.id);
      
      // 2. Добавляем продукты в корзину
      const productsAdded = await addProductsToCart(plan.recommendedProducts, addItem);
      
      // 3. Оформляем абонемент
      const membershipActivated = await activateMembership(plan.membershipRecommendation.type);
      
      if (trainerBooking && productsAdded && membershipActivated) {
        toast({
          title: "Трансформация началась! 🚀",
          description: "Все готово для вашего преображения",
        });
        
        // Переходим в личный кабинет
        router.push('/member-dashboard?transformation=started');
      }
    } catch (error) {
      console.error('Error starting transformation:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось начать программу. Попробуйте еще раз.",
        variant: "destructive"
      });
    }
  }, [router, toast]);

  // Поделиться результатами
  const shareResults = useCallback(async (
    analysis: BodyAnalysisResult,
    platform: 'instagram' | 'facebook' | 'twitter' | 'link'
  ) => {
    // ✅ ИСПРАВЛЕНО: используем _id вместо id
    const shareUrl = `${window.location.origin}/transformation/${analysis._id}`;
    const shareText = `Начинаю трансформацию с FitFlow Pro! AI предсказывает потенциал изменений ${analysis.progressPotential}%! 💪`;
    
    const shareData = {
      title: 'Моя фитнес-трансформация',
      text: shareText,
      url: shareUrl
    };

    try {
      if (platform === 'link') {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Ссылка скопирована!",
          description: "Поделитесь ей в социальных сетях",
        });
        return;
      }

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback для десктопа
        const shareUrls = {
          instagram: `https://www.instagram.com/create/story/?url=${encodeURIComponent(shareUrl)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        };

        window.open(shareUrls[platform], '_blank');
      }

      // ✅ ИСПРАВЛЕНО: используем _id вместо id
      await trackShareEvent(analysis._id, platform);
      
      // Даем бонус за шаринг
      toast({
        title: "Спасибо за шаринг! 🎉",
        description: "Вы получили 500 бонусных баллов",
      });
      
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [toast]);

  // Запросить сравнение с другими клиентами
  const compareWithOthers = useCallback((
    analysis: BodyAnalysisResult
  ) => {
    openWithAction('compare_progress', {
      // ✅ ИСПРАВЛЕНО: используем _id вместо id
      analysisId: analysis._id,
      bodyType: analysis.bodyType,
      currentMetrics: {
        bodyFat: analysis.estimatedBodyFat,
        muscleMass: analysis.estimatedMuscleMass
      },
      intent: 'compare_with_similar_users'
    });
  }, [openWithAction]);

  // Обновить прогресс (новое фото)
  const updateProgress = useCallback(async (
    originalAnalysisId: string,
    newPhoto: File
  ) => {
    // Анализируем новое фото
    const newAnalysis = await analyzeProgressPhoto(originalAnalysisId, newPhoto);
    
    // Открываем AI консультацию с результатами сравнения
    openWithAction('progress_update', {
      originalAnalysisId,
      newAnalysis,
      intent: 'analyze_progress',
      comparison: newAnalysis.comparisonWithOriginal
    });
    
    return newAnalysis;
  }, [openWithAction]);

  return {
    openAnalysisConsultation,
    requestPlanAdjustment,
    startTransformation,
    shareResults,
    compareWithOthers,
    updateProgress
  };
};

// Вспомогательные функции для API
async function bookTrainer(trainerId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/bookings/trainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, autoBook: true })
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function addProductsToCart(products: any[], addItem: any): Promise<boolean> {
  try {
    // Добавляем каждый продукт в корзину через store
    products.forEach(product => {
      const cartData = {
        id: product.productId,
        name: product.name,
        price: product.monthlyBudget,
        imageUrl: `/images/products/${product.productId}.jpg`,
        category: 'supplements',
        inStock: 100,
        nutrition: {}
      };
      addItem(cartData, 1);
    });
    
    return true;
  } catch {
    return false;
  }
}

async function activateMembership(type: string): Promise<boolean> {
  try {
    const response = await fetch('/api/memberships/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, source: 'body_analysis' })
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ✅ ИСПРАВЛЕНО: параметр принимает string | Id, конвертируем в string
async function trackShareEvent(analysisId: string | any, platform: string): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'body_analysis_shared',
        properties: { 
          analysisId: String(analysisId), // Конвертируем в string на всякий случай
          platform 
        }
      })
    });
  } catch {
    console.error('Failed to track share event');
  }
}

async function analyzeProgressPhoto(
  originalAnalysisId: string, 
  newPhoto: File
): Promise<any> {
  const formData = new FormData();
  formData.append('photo', newPhoto);
  formData.append('originalAnalysisId', originalAnalysisId);
  
  const response = await fetch('/api/body-analysis/progress', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze progress photo');
  }
  
  return response.json();
}