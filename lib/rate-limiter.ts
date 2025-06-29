// lib/rate-limiter.ts
class EmailRateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static readonly WINDOW_MS = 60 * 1000; // 1 минута
  private static readonly MAX_REQUESTS = 10; // 10 писем в минуту

  static canSend(email: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(email) || [];
    
    // Удаляем старые запросы
    const validRequests = requests.filter(time => now - time < this.WINDOW_MS);
    
    if (validRequests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(email, validRequests);
    
    return true;
  }

  static getRemainingRequests(email: string): number {
    const now = Date.now();
    const requests = this.requests.get(email) || [];
    const validRequests = requests.filter(time => now - time < this.WINDOW_MS);
    
    return Math.max(0, this.MAX_REQUESTS - validRequests.length);
  }
}
