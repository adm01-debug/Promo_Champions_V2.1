class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  get<T = any>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

export const cacheManager = new CacheManager();
