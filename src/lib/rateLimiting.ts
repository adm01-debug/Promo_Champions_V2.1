// Advanced Rate Limiting
class RateLimiter {
  private limits: Map<string, number[]> = new Map();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.limits.get(key) || [];
    
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.limits.set(key, validTimestamps);
    return true;
  }

  reset(key: string) {
    this.limits.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!rateLimiter.check(key, 100, 60000)) {
    throw new Error('Rate limit exceeded');
  }
  return fn();
}
