// hooks/useScanProgress.ts - Хук для прогресса сканирования
import { useState, useCallback } from 'react';

interface ScanProgress {
  stage: 'initializing' | 'detecting' | 'analyzing' | 'processing' | 'complete' | 'failed';
  progress: number;
  countdown: number;
}

export const useScanProgress = () => {
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    stage: 'initializing',
    progress: 0,
    countdown: 3
  });

  const runScanProgress = useCallback(async () => {
    const steps = [
      { stage: 'detecting' as const, duration: 800 },
      { stage: 'analyzing' as const, duration: 2000 },
      { stage: 'processing' as const, duration: 1200 }
    ];

    for (const step of steps) {
      setScanProgress(prev => ({ ...prev, stage: step.stage, progress: 0 }));
      
      const startTime = Date.now();
      await new Promise<void>((resolve) => {
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / step.duration) * 100, 100);
          setScanProgress(prev => ({ ...prev, progress }));
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            resolve();
          }
        }, 50);
      });
    }

    setScanProgress({ stage: 'complete', progress: 100, countdown: 0 });
  }, []);

  const resetProgress = useCallback(() => {
    setScanProgress({ stage: 'initializing', progress: 0, countdown: 3 });
  }, []);

  return {
    scanProgress,
    runScanProgress,
    resetProgress
  };
};
