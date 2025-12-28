// Melhorias 89-91 - Rate Limiting System
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  canMakeRequest(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove expired attempts
    const validAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Usage in login
export const useLogin = () => {
  const handleLogin = async (email: string, password: string) => {
    if (!rateLimiter.canMakeRequest(`login:${email}`, 5, 60000)) {
      toast.error('Too many login attempts. Please wait 1 minute.');
      return;
    }
    
    // Proceed with login
  };
};
