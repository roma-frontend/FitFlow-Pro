// utils/storage.ts
class LocalStorageManager {
    private prefix = 'fitflow_';
  
    set<T>(key: string, value: T): boolean {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(this.prefix + key, serialized);
        return true;
      } catch (error) {
        console.error('LocalStorage set error:', error);
        return false;
      }
    }
  
    get<T>(key: string, defaultValue?: T): T | null {
      try {
        const item = localStorage.getItem(this.prefix + key);
        if (item === null) return defaultValue ?? null;
        return JSON.parse(item);
      } catch (error) {
        console.error('LocalStorage get error:', error);
        return defaultValue ?? null;
      }
    }
  
    remove(key: string): boolean {
      try {
        localStorage.removeItem(this.prefix + key);
        return true;
      } catch (error) {
        console.error('LocalStorage remove error:', error);
        return false;
      }
    }
  
    clear(): boolean {
      try {
        Object.keys(localStorage)
          .filter(key => key.startsWith(this.prefix))
          .forEach(key => localStorage.removeItem(key));
        return true;
      } catch (error) {
        console.error('LocalStorage clear error:', error);
        return false;
      }
    }
  }
  
  export const storage = new LocalStorageManager();