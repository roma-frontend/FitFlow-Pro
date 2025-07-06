import { useState, useEffect, useCallback } from 'react';
import type { ActivityData } from '../types';

interface HealthKitJS {
  requestAuthorization: (types: string[]) => Promise<boolean>;
  querySampleType: (
    type: string,
    options: {
      start: Date;
      end: Date;
      limit?: number;
    }
  ) => Promise<Array<{ value: number; startDate: string; endDate: string }>>;
}

export const useHealthKit = () => {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [isHealthKitAvailable, setIsHealthKitAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we're on iOS and HealthKit is available
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsHealthKitAvailable(isIOS);

    if (isIOS && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/healthkitjs@latest/dist/healthkit.js';
      script.async = true;
      
      script.onload = () => {
        if ('HealthKit' in window) {
          setIsHealthKitAvailable(true);
        }
      };

      script.onerror = () => {
        console.error('Failed to load HealthKit script');
        setIsHealthKitAvailable(false);
      };

      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const connectAppleHealth = useCallback(async (): Promise<boolean> => {
    if (!isHealthKitAvailable) {
      console.error("HealthKit is not available on this device");
      return false;
    }

    setIsLoading(true);

    try {
      if (!('HealthKit' in window)) {
        throw new Error("HealthKit not loaded");
      }

      const healthKit = (window as any).HealthKit as HealthKitJS;

      // Request authorization
      const authorized = await healthKit.requestAuthorization([
        'activeEnergyBurned',
        'stepCount',
        'heartRate',
        'sleepAnalysis'
      ]);

      if (!authorized) {
        setIsLoading(false);
        return false;
      }

      // Get data from last 24 hours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      // Fetch all data in parallel
      const [stepsData, heartRateData, energyData, sleepData] = await Promise.all([
        healthKit.querySampleType('stepCount', { start: startDate, end: endDate }),
        healthKit.querySampleType('heartRate', { start: startDate, end: endDate, limit: 1 }),
        healthKit.querySampleType('activeEnergyBurned', { start: startDate, end: endDate }),
        healthKit.querySampleType('sleepAnalysis', { start: startDate, end: endDate })
      ]);

      // Process data
      const totalSteps = stepsData.reduce((sum, item) => sum + item.value, 0);
      const latestHeartRate = heartRateData.length > 0 ? Math.round(heartRateData[0].value) : 0;
      const totalEnergy = energyData.reduce((sum, item) => sum + item.value, 0);
      
      const totalSleepMinutes = sleepData.reduce((sum, item) => {
        const start = new Date(item.startDate).getTime();
        const end = new Date(item.endDate).getTime();
        return sum + (end - start) / 60000;
      }, 0);

      setActivityData({
        steps: totalSteps,
        heartRate: latestHeartRate,
        activeEnergy: totalEnergy,
        sleepHours: totalSleepMinutes / 60,
        lastSync: new Date()
      });

      setIsLoading(false);
      return true;

    } catch (error) {
      console.error("Apple Health error:", error);
      setIsLoading(false);
      return false;
    }
  }, [isHealthKitAvailable]);

  return {
    activityData,
    setActivityData,
    connectAppleHealth,
    isHealthKitAvailable,
    isLoading
  };
};