// Rate Limiting System
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const limiters = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const limiter = limiters.get(key);

  if (!limiter || now > limiter.resetAt) {
    limiters.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    });
    return true;
  }

  if (limiter.count >= config.maxRequests) {
    return false;
  }

  limiter.count++;
  return true;
}

export function checkRateLimit(userId: string, endpoint: string): boolean {
  return rateLimit(`${userId}:${endpoint}`, {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  });
}

export function checkIPRateLimit(ip: string): boolean {
  return rateLimit(`ip:${ip}`, {
    maxRequests: 1000,
    windowMs: 60000
  });
}
