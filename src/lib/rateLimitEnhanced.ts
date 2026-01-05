interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private configs: Record<string, RateLimitConfig> = {
    api: { windowMs: 60000, maxRequests: 100 },
    auth: { windowMs: 300000, maxRequests: 5 },
    search: { windowMs: 10000, maxRequests: 20 },
    export: { windowMs: 60000, maxRequests: 10 },
    default: { windowMs: 60000, maxRequests: 60 },
  };

  constructor() {
    this.startCleanup();
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.storage.entries()) {
        if (now > entry.resetAt) {
          this.storage.delete(key);
        }
      }
    }, 60000);
  }

  async checkRateLimit(
    identifier: string,
    endpoint: string = 'default'
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  }> {
    const config = this.configs[endpoint] || this.configs.default;
    const key = `${endpoint}:${identifier}`;
    const now = Date.now();

    let entry = this.storage.get(key);

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + config.windowMs,
      };
    }

    entry.count++;
    this.storage.set(key, entry);

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000);

    return {
      allowed,
      remaining,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  async resetRateLimit(identifier: string, endpoint: string = 'default') {
    const key = `${endpoint}:${identifier}`;
    this.storage.delete(key);
  }

  setConfig(endpoint: string, config: RateLimitConfig) {
    this.configs[endpoint] = config;
  }
}

export const rateLimiter = new RateLimiter();

export const withRateLimit = async <T>(
  identifier: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> => {
  const result = await rateLimiter.checkRateLimit(identifier, endpoint);

  if (!result.allowed) {
    throw new Error(
      `Rate limit exceeded. Try again in ${result.retryAfter} seconds`
    );
  }

  return fn();
};

export const useRateLimit = (endpoint: string = 'default') => {
  const checkLimit = async (identifier?: string) => {
    const id = identifier || (await getCurrentUserId());
    return rateLimiter.checkRateLimit(id, endpoint);
  };

  return { checkLimit };
};

async function getCurrentUserId(): Promise<string> {
  return 'user-' + Math.random().toString(36).substr(2, 9);
}
