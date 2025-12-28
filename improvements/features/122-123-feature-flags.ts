// Melhorias 122-123 - Feature Flags & A/B Testing

interface FeatureFlags {
  newDashboard: boolean;
  aiCoaching: boolean;
  advancedReports: boolean;
  realTimeChat: boolean;
}

class FeatureFlagManager {
  private flags: FeatureFlags = {
    newDashboard: false,
    aiCoaching: true,
    advancedReports: false,
    realTimeChat: false,
  };

  async loadFlags(userId: string) {
    // Fetch from backend/database
    const { data } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      this.flags = { ...this.flags, ...data.flags };
    }
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] ?? false;
  }

  enable(flag: keyof FeatureFlags) {
    this.flags[flag] = true;
  }

  disable(flag: keyof FeatureFlags) {
    this.flags[flag] = false;
  }
}

export const featureFlags = new FeatureFlagManager();

// A/B Testing
class ABTestManager {
  private variants: Map<string, string> = new Map();

  getVariant(testName: string, userId: string): 'A' | 'B' {
    // Deterministic variant based on user ID
    const hash = this.hashCode(userId + testName);
    return hash % 2 === 0 ? 'A' : 'B';
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  trackConversion(testName: string, variant: string, userId: string) {
    // Send to analytics
    fetch('/api/ab-test/conversion', {
      method: 'POST',
      body: JSON.stringify({ testName, variant, userId }),
    });
  }
}

export const abTest = new ABTestManager();

// Usage:
// const variant = abTest.getVariant('new-onboarding', user.id);
// if (variant === 'A') {
//   return <OldOnboarding />;
// } else {
//   return <NewOnboarding />;
// }
