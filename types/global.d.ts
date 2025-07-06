// global.d.ts
interface HealthKitJS {
  requestAuthorization: (types: string[]) => Promise<boolean>;
  querySampleType: (
    type: string,
    options: { start: Date; end: Date; limit?: number }
  ) => Promise<Array<{ value: number; startDate: string; endDate: string }>>;
}

declare global {
  interface Window {
    HealthKit?: HealthKitJS;
  }
}