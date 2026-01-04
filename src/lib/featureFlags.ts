// Feature Flags System
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
}

interface FeatureFlagsStore {
  flags: Record<string, FeatureFlag>;
  setFlag: (key: string, enabled: boolean) => void;
  isEnabled: (key: string) => boolean;
  loadFlags: (flags: FeatureFlag[]) => void;
}

export const useFeatureFlags = create<FeatureFlagsStore>()(
  persist(
    (set, get) => ({
      flags: {},
      
      setFlag: (key, enabled) =>
        set((state) => ({
          flags: {
            ...state.flags,
            [key]: { ...state.flags[key], enabled },
          },
        })),
      
      isEnabled: (key) => {
        const flag = get().flags[key];
        if (!flag) return false;
        
        // Gradual rollout
        if (flag.rolloutPercentage !== undefined) {
          const userId = localStorage.getItem('userId') || '';
          const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const userPercentage = hash % 100;
          return userPercentage < flag.rolloutPercentage && flag.enabled;
        }
        
        return flag.enabled;
      },
      
      loadFlags: (flags) =>
        set({
          flags: flags.reduce(
            (acc, flag) => ({ ...acc, [flag.key]: flag }),
            {}
          ),
        }),
    }),
    { name: 'feature-flags' }
  )
);

// Default flags
export const defaultFlags: FeatureFlag[] = [
  {
    key: 'offline-mode',
    enabled: true,
    description: 'Enable offline support',
  },
  {
    key: 'ai-assistant',
    enabled: false,
    description: 'AI Voice Assistant',
    rolloutPercentage: 10,
  },
  {
    key: 'collaboration',
    enabled: true,
    description: 'Real-time collaboration',
  },
  {
    key: 'advanced-analytics',
    enabled: true,
    description: 'Advanced analytics features',
  },
];

// HOC for feature-gated components
export const withFeatureFlag = (
  Component: React.ComponentType,
  flagKey: string,
  Fallback?: React.ComponentType
) => {
  return (props: any) => {
    const isEnabled = useFeatureFlags((state) => state.isEnabled(flagKey));
    
    if (!isEnabled) {
      return Fallback ? <Fallback {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
};
