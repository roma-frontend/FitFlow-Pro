"use client";

import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

export const useLoading = (initialState: LoadingState = { isLoading: false }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

  const startLoading = useCallback((text?: string) => {
    setLoadingState({
      isLoading: true,
      loadingText: text,
      progress: 0
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingText: undefined,
      progress: undefined
    });
  }, []);

  const updateProgress = useCallback((progress: number, text?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress,
      loadingText: text || prev.loadingText
    }));
  }, []);

  const updateText = useCallback((text: string) => {
    setLoadingState(prev => ({
      ...prev,
      loadingText: text
    }));
  }, []);

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    updateProgress,
    updateText,
    setLoadingState
  };
};

// Хук для загрузки с автоматическим прогрессом
export const useProgressiveLoading = (
  steps: string[],
  stepDuration: number = 1000
) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const loading = useLoading();

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
    loading.startLoading(steps[0]);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        
        if (nextStep >= steps.length) {
          clearInterval(interval);
          setIsComplete(true);
          loading.stopLoading();
          return prev;
        }

        loading.updateProgress(
          (nextStep / steps.length) * 100,
          steps[nextStep]
        );
        
        return nextStep;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [steps, stepDuration, loading]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
    loading.stopLoading();
  }, [loading]);

  return {
    ...loading,
    currentStep,
    isComplete,
    totalSteps: steps.length,
    currentStepText: steps[currentStep],
    start,
    reset
  };
};
