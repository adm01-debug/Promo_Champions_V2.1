type FeatureFlag = 'realtime' | 'analytics' | 'advanced-filters' | 'bulk-actions';

class FeatureFlags {
  private flags: Record<string, boolean> = {
    realtime: import.meta.env.VITE_ENABLE_REALTIME === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    'advanced-filters': true,
    'bulk-actions': true,
  };

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags[flag] ?? false;
  }

  enable(flag: FeatureFlag) {
    this.flags[flag] = true;
  }

  disable(flag: FeatureFlag) {
    this.flags[flag] = false;
  }
}

export const featureFlags = new FeatureFlags();
