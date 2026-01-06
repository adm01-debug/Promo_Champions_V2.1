// Advanced Data Caching Strategy

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

interface CacheConfig {
  defaultTTL: number;
  maxEntries: number;
  persistToStorage: boolean;
  storageKey: string;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
    persistToStorage: true,
    storageKey: 'app_query_cache',
  };

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  private loadFromStorage() {
    if (!this.config.persistToStorage) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, CacheEntry<unknown>>;
        Object.entries(parsed).forEach(([key, entry]) => {
          if (!this.isExpired(entry)) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('[Cache] Failed to load from storage:', error);
    }
  }

  private saveToStorage() {
    if (!this.config.persistToStorage) return;

    try {
      const entries: Record<string, CacheEntry<unknown>> = {};
      this.cache.forEach((entry, key) => {
        if (!this.isExpired(entry)) {
          entries[key] = entry;
        }
      });
      localStorage.setItem(this.config.storageKey, JSON.stringify(entries));
    } catch (error) {
      console.warn('[Cache] Failed to save to storage:', error);
    }
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.timestamp + entry.ttl;
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private cleanup() {
    let removed = 0;
    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    });

    // Evict oldest entries if over max
    if (this.cache.size > this.config.maxEntries) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = this.cache.size - this.config.maxEntries;
      sortedEntries.slice(0, toRemove).forEach(([key]) => {
        this.cache.delete(key);
        removed++;
      });
    }

    if (removed > 0) {
      this.saveToStorage();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number, tags: string[] = []) {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTTL,
      tags,
    };

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  invalidate(key: string) {
    this.cache.delete(key);
    this.saveToStorage();
  }

  invalidateByTag(tag: string) {
    this.cache.forEach((entry, key) => {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    });
    this.saveToStorage();
  }

  invalidateAll() {
    this.cache.clear();
    this.saveToStorage();
  }

  getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    tags: string[] = []
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    return fetcher().then((data) => {
      this.set(key, data, ttl, tags);
      return data;
    });
  }

  configure(config: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config };
  }

  getStats() {
    let expired = 0;
    let valid = 0;
    
    this.cache.forEach((entry) => {
      if (this.isExpired(entry)) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.cache.size,
      valid,
      expired,
      maxEntries: this.config.maxEntries,
    };
  }
}

export const queryCache = new QueryCache();

// React hook for cache
export function useQueryCache() {
  return queryCache;
}
