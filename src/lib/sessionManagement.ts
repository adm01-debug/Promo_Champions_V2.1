// Session Management
import { supabase } from '@/integrations/supabase/client';

export interface SessionInfo {
  userId: string;
  email: string;
  lastActivity: number;
  expiresAt: number;
}

class SessionManager {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private activityTimer: number | null = null;
  private warningTimer: number | null = null;
  
  init() {
    this.resetActivityTimer();
    this.setupActivityListeners();
  }
  
  private setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.onActivity(), { passive: true });
    });
  }
  
  private onActivity() {
    this.updateLastActivity();
    this.resetActivityTimer();
  }
  
  private updateLastActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
  
  getLastActivity(): number {
    const stored = localStorage.getItem('lastActivity');
    return stored ? parseInt(stored) : Date.now();
  }
  
  isSessionExpired(): boolean {
    const lastActivity = this.getLastActivity();
    return Date.now() - lastActivity > this.SESSION_TIMEOUT;
  }
  
  getTimeUntilExpiry(): number {
    const lastActivity = this.getLastActivity();
    const elapsed = Date.now() - lastActivity;
    return Math.max(0, this.SESSION_TIMEOUT - elapsed);
  }
  
  private resetActivityTimer() {
    if (this.activityTimer) {
      window.clearTimeout(this.activityTimer);
    }
    
    if (this.warningTimer) {
      window.clearTimeout(this.warningTimer);
    }
    
    // Set warning timer
    this.warningTimer = window.setTimeout(() => {
      this.showExpiryWarning();
    }, this.SESSION_TIMEOUT - this.WARNING_THRESHOLD);
    
    // Set expiry timer
    this.activityTimer = window.setTimeout(() => {
      this.handleSessionExpiry();
    }, this.SESSION_TIMEOUT);
  }
  
  private showExpiryWarning() {
    const timeLeft = Math.ceil(this.getTimeUntilExpiry() / 1000 / 60);
    console.warn(`Session will expire in ${timeLeft} minutes`);
    // Could show a toast notification here
  }
  
  private async handleSessionExpiry() {
    console.log('Session expired - logging out');
    await supabase.auth.signOut();
    window.location.href = '/login?expired=true';
  }
  
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      this.updateLastActivity();
      this.resetActivityTimer();
      return true;
    }
    return false;
  }
  
  destroy() {
    if (this.activityTimer) {
      window.clearTimeout(this.activityTimer);
    }
    if (this.warningTimer) {
      window.clearTimeout(this.warningTimer);
    }
  }
}

export const sessionManager = new SessionManager();
