// utils/cleanTypes.ts (для проверки отсутствия дублирований)
import { GlobalDebugCommands } from '@/types/debug';

// ✅ ПРОВЕРЯЕМ ЧТО ТИПЫ ИМПОРТИРУЮТСЯ КОРРЕКТНО
export const validateTypes = () => {
  console.log('🔍 Проверка типов...');
  
  // Проверяем что типы доступны
  const testCommands: GlobalDebugCommands = {
    help: () => {},
    checkSync: () => {},
    sync: async () => {},
    clear: async () => {},
    test: async () => {},
    stats: () => ({}),
    check: () => {},
    addEvents: async () => {},
    updateLastEvent: async () => {},
    deleteLastEvent: async () => {},
    clearEvents: async () => {},
    refreshAll: async () => {},
    stressTest: async () => {},
    simulateDesync: () => {},
    getStats: () => ({}),
    forceSyncContexts: async () => {},
    diagnoseSync: () => ({}),
    clearAllEvents: async () => {}
  };
  
  console.log('✅ Типы корректны');
  return testCommands;
};

// ✅ ФУНКЦИЯ ДЛЯ БЕЗОПАСНОЙ ИНИЦИАЛИЗАЦИИ WINDOW.FITACCESSDEBUG
export const initializeDebugStub = (): GlobalDebugCommands => {
  return {
    help: () => console.log('Debug система еще не инициализирована'),
    checkSync: () => console.log('Debug система еще не инициализирована'),
    sync: async () => console.log('Debug система еще не инициализирована'),
    clear: async () => console.log('Debug система еще не инициализирована'),
    test: async () => console.log('Debug система еще не инициализирована'),
    stats: () => ({ error: 'Debug система еще не инициализирована' }),
    check: () => console.log('Debug система еще не инициализирована'),
    addEvents: async () => console.log('Debug система еще не инициализирована'),
    updateLastEvent: async () => console.log('Debug система еще не инициализирована'),
    deleteLastEvent: async () => console.log('Debug система еще не инициализирована'),
    clearEvents: async () => console.log('Debug система еще не инициализирована'),
        refreshAll: async () => console.log('Debug система еще не инициализирована'),
    stressTest: async () => console.log('Debug система еще не инициализирована'),
    simulateDesync: () => console.log('Debug система еще не инициализирована'),
    getStats: () => ({ error: 'Debug система еще не инициализирована' }),
    forceSyncContexts: async () => console.log('Debug система еще не инициализирована'),
    diagnoseSync: () => ({ error: 'Debug система еще не инициализирована' }),
    clearAllEvents: async () => console.log('Debug система еще не инициализирована')
  };
};

// ✅ ЕДИНАЯ ФУНКЦИЯ ДЛЯ ИНИЦИАЛИЗАЦИИ DEBUG СИСТЕМЫ
export const ensureDebugSystem = () => {
  if (typeof window !== 'undefined' && !window.fitAccessDebug) {
    window.fitAccessDebug = initializeDebugStub();
    console.log('🔧 Debug система инициализирована с заглушками');
  }
};

