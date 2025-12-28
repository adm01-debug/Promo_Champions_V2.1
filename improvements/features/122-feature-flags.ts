// Melhoria 122 - Feature Flags
const FEATURES = {
  AI_ASSISTANT: 'ai_assistant',
  COLLABORATION: 'collaboration',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  WEBHOOKS: 'webhooks',
};

class FeatureFlagManager {
  private flags: Record<string, boolean> = {};

  async loadFlags(userId: string) {
    const { data } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('user_id', userId);
    
    this.flags = data?.reduce((acc, flag) => ({
      ...acc,
      [flag.feature]: flag.enabled
    }), {}) || {};
  }

  isEnabled(feature: string): boolean {
    return this.flags[feature] ?? false;
  }

  async toggle(feature: string, enabled: boolean) {
    await supabase.from('feature_flags').upsert({
      user_id: userId,
      feature,
      enabled
    });
    this.flags[feature] = enabled;
  }
}

export const featureFlags = new FeatureFlagManager();
