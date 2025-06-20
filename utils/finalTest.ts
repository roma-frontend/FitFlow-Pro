// utils/finalTest.ts (финальная проверка всех исправлений)
import { GlobalDebugCommands } from '@/types/debug';
import { ensureDebugSystem, validateTypes } from '@/utils/cleanTypes';

export const runFinalTest = () => {
  console.log('🧪 Запуск финального теста debug системы...');
  
  // ✅ ТЕСТ 1: Проверка типов
  try {
    validateTypes();
    console.log('✅ Тест 1: Типы корректны');
  } catch (error) {
    console.error('❌ Тест 1: Ошибка типов:', error);
    return false;
  }
  
  // ✅ ТЕСТ 2: Проверка инициализации
  try {
    ensureDebugSystem();
    
    if (!window.fitAccessDebug) {
      throw new Error('fitAccessDebug не инициализирован');
    }
    
    console.log('✅ Тест 2: Инициализация успешна');
  } catch (error) {
    console.error('❌ Тест 2: Ошибка инициализации:', error);
    return false;
  }
  
  // ✅ ТЕСТ 3: Проверка всех обязательных команд
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
    console.error('❌ Тест 3: Отсутствуют команды:', missingCommands);
    return false;
  }
  
  console.log('✅ Тест 3: Все команды доступны');
  
  // ✅ ТЕСТ 4: Проверка выполнения команд
  try {
    window.fitAccessDebug.check();
    const stats = window.fitAccessDebug.stats();
    
    if (!stats || typeof stats !== 'object') {
      throw new Error('stats() не возвращает объект');
    }
    
    console.log('✅ Тест 4: Команды выполняются корректно');
  } catch (error) {
    console.error('❌ Тест 4: Ошибка выполнения команд:', error);
    return false;
  }
  
  // ✅ ТЕСТ 5: Проверка контекстов (если доступны)
  const contextNames = ['schedule', 'dashboard', 'superAdmin'];
  const availableContexts = contextNames.filter(name => 
    window.fitAccessDebug[name as keyof GlobalDebugCommands]
  );
  
  console.log(`✅ Тест 5: Доступно контекстов: $${availableContexts.length}/$${contextNames.length}`);
  console.log('📋 Доступные контексты:', availableContexts);
  
  // ✅ ТЕСТ 6: Проверка глобальных функций
  try {
    if (typeof window.diagnoseContexts === 'function') {
      console.log('✅ Тест 6: diagnoseContexts доступна');
    }
    
    if (typeof window.forceRegisterContexts === 'function') {
      console.log('✅ Тест 6: forceRegisterContexts доступна');
    }
  } catch (error) {
    console.warn('⚠️ Тест 6: Некоторые глобальные функции недоступны:', error);
  }
  
  console.log('🎉 Все тесты пройдены успешно!');
  console.log('💡 Debug система готова к использованию');
  console.log('📖 Справка: fitAccessDebug.help()');
  
  return true;
};

// ✅ АВТОМАТИЧЕСКИЙ ЗАПУСК В DEVELOPMENT
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Запускаем финальный тест через 6 секунд после загрузки
  setTimeout(() => {
    runFinalTest();
  }, 6000);
}
