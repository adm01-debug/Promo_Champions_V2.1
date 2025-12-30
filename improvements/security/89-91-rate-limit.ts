// Melhorias 89-91 - Rate Limiting
class RateLimiter {
  private attempts = new Map<string, { count: number; resetAt: number }>();

  canMakeRequest(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) return false;

    record.count++;
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// 89: Login rate limit
export const useLoginRateLimit = () => {
  const canLogin = () => rateLimiter.canMakeRequest('login', 5, 60000);
  return { canLogin };
};

// 90: API rate limit
export const useAPIRateLimit = () => {
  const canCallAPI = () => rateLimiter.canMakeRequest('api', 100, 60000);
  return { canCallAPI };
};

// 91: Email rate limit
export const useEmailRateLimit = () => {
  const canSendEmail = () => rateLimiter.canMakeRequest('email', 10, 3600000);
  return { canSendEmail };
};
