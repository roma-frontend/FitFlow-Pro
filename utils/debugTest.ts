// utils/debugTest.ts (для тестирования исправлений)
import { GlobalDebugCommands } from '@/types/debug';
import { getContext, isContextAvailable, getAllContextStats, safeDebugCall } from '@/utils/typeUtils';

export const testDebugSystem = () => {
  console.log('🧪 Тестирование debug системы...');
  
  // ✅ ТЕСТ 1: Проверка доступности fitAccessDebug
  if (typeof window === 'undefined') {
    console.log('❌ Window объект недоступен');
    return false;
  }
  
  if (!window.fitAccessDebug) {
    console.log('❌ fitAccessDebug не инициализирован');
    return false;
  }
  
  console.log('✅ fitAccessDebug доступен');
  
  // ✅ ТЕСТ 2: Проверка обязательных команд
  const requiredCommands = [
    'help', 'checkSync', 'sync', 'clear', 'test', 'stats', 
    'check', 'addEvents', 'updateLastEvent', 'deleteLastEvent',
    'clearEvents', 'refreshAll', 'stressTest', 'simulateDesync',
    'getStats', 'forceSyncContexts', 'diagnoseSync', 'clearAllEvents'
  ];
  
  const missingCommands = requiredCommands.filter(cmd => 
    typeof (window.fitAccessDebug as any)[cmd] !== 'function'
  );
  
  if (missingCommands.length > 0) {
    console.log('❌ Отсутствуют команды:', missingCommands);
    return false;
  }
  
  console.log('✅ Все обязательные команды доступны');
  
  // ✅ ТЕСТ 3: Проверка контекстов
  const contextStats = getAllContextStats();
  console.log('📊 Статистика контекстов:', contextStats);
  
  const availableContexts = Object.entries(contextStats)
    .filter(([_, stats]) => stats.available)
    .map(([name]) => name);
  
  console.log('✅ Доступные контексты:', availableContexts);
  
  // ✅ ТЕСТ 4: Проверка безопасных вызовов
  try {
    const helpResult = safeDebugCall('help');
    const checkResult = safeDebugCall('check');
    const statsResult = safeDebugCall('stats');
    
    console.log('✅ Безопасные вызовы работают');
  } catch (error) {
    console.log('❌ Ошибка безопасных вызовов:', error);
    return false;
  }
  
  // ✅ ТЕСТ 5: Проверка типов
  try {
    const debugSystem: GlobalDebugCommands = window.fitAccessDebug;
    
    // Проверяем что все свойства соответствуют типам
    if (typeof debugSystem.help !== 'function') {
      throw new Error('help не является функцией');
    }
    
    if (typeof debugSystem.checkSync !== 'function') {
      throw new Error('checkSync не является функцией');
    }
    
    console.log('✅ Типы корректны');
  } catch (error) {
    console.log('❌ Ошибка типов:', error);
    return false;
  }
  
  console.log('🎉 Все тесты пройдены успешно!');
  console.log('💡 Попробуйте: fitAccessDebug.help()');
  
  return true;
};

// ✅ АВТОМАТИЧЕСКИЙ ЗАПУСК ТЕСТОВ В DEVELOPMENT
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Запускаем тесты через 5 секунд после загрузки
  setTimeout(() => {
    if (window.fitAccessDebug) {
      testDebugSystem();
    } else {
      console.log('⏳ Debug система еще не готова, повторим через 5 секунд...');
      setTimeout(() => {
        if (window.fitAccessDebug) {
          testDebugSystem();
        }
      }, 5000);
    }
  }, 5000);
}
