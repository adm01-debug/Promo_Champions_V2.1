// CSRF Protection
import { v4 as uuidv4 } from 'uuid';

class CSRFProtection {
  private token: string | null = null;
  
  generateToken(): string {
    this.token = uuidv4();
    sessionStorage.setItem('csrf_token', this.token);
    return this.token;
  }
  
  getToken(): string | null {
    if (!this.token) {
      this.token = sessionStorage.getItem('csrf_token');
    }
    return this.token;
  }
  
  validateToken(token: string): boolean {
    return token === this.getToken();
  }
  
  clearToken(): void {
    this.token = null;
    sessionStorage.removeItem('csrf_token');
  }
}

export const csrfProtection = new CSRFProtection();

// Middleware for fetch requests
export const withCSRF = (url: string, options: RequestInit = {}): RequestInit => {
  const token = csrfProtection.getToken();
  
  if (!token) {
    csrfProtection.generateToken();
  }
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfProtection.getToken() || '',
    },
  };
};
