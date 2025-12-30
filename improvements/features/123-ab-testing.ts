// Melhoria 123 - A/B Testing
class ABTestManager {
  private variant: string | null = null;

  getVariant(testName: string): 'A' | 'B' {
    const stored = localStorage.getItem(`ab_${testName}`);
    if (stored) return stored as 'A' | 'B';

    const variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(`ab_${testName}`, variant);
    
    // Track assignment
    this.trackEvent(`ab_${testName}_assigned`, { variant });
    
    return variant;
  }

  trackConversion(testName: string, goal: string) {
    const variant = this.getVariant(testName);
    this.trackEvent(`ab_${testName}_conversion`, { variant, goal });
  }

  private trackEvent(event: string, data: any) {
    // Send to analytics
    console.log('📊 A/B Test Event:', event, data);
  }
}

export const abTest = new ABTestManager();
