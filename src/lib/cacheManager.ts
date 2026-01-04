// Advanced Cache Manager
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

class CacheManager {
  private cache = new Map<string, { data: any; expires: number }>();
  private accessLog = new Map<string, number>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_SIZE = 100;
  
  set(key: string, data: any, options?: CacheOptions) {
    const ttl = options?.ttl || this.DEFAULT_TTL;
    const expires = Date.now() + ttl;
    
    // Evict if cache is full
    if (this.cache.size >= (options?.maxSize || this.MAX_SIZE)) {
      this.evictLRU();
    }
    
    this.cache.set(key, { data, expires });
    this.accessLog.set(key, Date.now());
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.accessLog.delete(key);
      return null;
    }
    
    this.accessLog.set(key, Date.now());
    return entry.data as T;
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.accessLog.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key: string) {
    this.cache.delete(key);
    this.accessLog.delete(key);
  }
  
  clear() {
    this.cache.clear();
    this.accessLog.clear();
  }
  
  private evictLRU() {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.accessLog) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  invalidatePattern(pattern: RegExp) {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }
  
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheManager = new CacheManager();
