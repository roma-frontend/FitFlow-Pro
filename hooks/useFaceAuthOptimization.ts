// hooks/useFaceAuthOptimization.ts
import { useCallback, useMemo } from "react";

export const useFaceAuthOptimization = () => {
  // Мемоизируем тяжелые вычисления
  const memoizedDescriptorGenerator = useMemo(() => {
    return () => new Float32Array(Array.from({ length: 128 }, () => Math.random()));
  }, []);

  // Оптимизированная функция создания mock данных
  const createMockFaceData = useCallback((confidence: number) => {
    const boundingBox = {
      x: 50, y: 50, width: 200, height: 200,
      top: 50, left: 50, bottom: 250, right: 250,
    };

    return {
      descriptor: memoizedDescriptorGenerator(),
      confidence,
      landmarks: [
        { x: 100, y: 80 }, { x: 140, y: 80 }, { x: 120, y: 100 },
        { x: 110, y: 130 }, { x: 130, y: 130 },
      ],
      boundingBox,
      detection: {
        box: boundingBox,
        score: confidence / 100,
        classScore: confidence / 100,
        className: "face",
      },
      box: boundingBox,
    };
  }, [memoizedDescriptorGenerator]);

  return { createMockFaceData };
};
