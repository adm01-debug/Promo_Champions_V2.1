import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeatureFlags {
  enableRealtime: boolean;
  enableAnalytics: boolean;
  enableGamification: boolean;
  enableAI: boolean;
  enableVoice: boolean;
  enableCollaboration: boolean;
  enableAdvancedFilters: boolean;
  enableBulkActions: boolean;
  enableExport: boolean;
  enable2FA: boolean;
}

interface FeatureFlagsStore extends FeatureFlags {
  setFlag: (flag: keyof FeatureFlags, value: boolean) => void;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
}

export const useFeatureFlags = create<FeatureFlagsStore>()(
  persist(
    (set, get) => ({
      // Default values
      enableRealtime: true,
      enableAnalytics: true,
      enableGamification: true,
      enableAI: true,
      enableVoice: false,
      enableCollaboration: false,
      enableAdvancedFilters: true,
      enableBulkActions: true,
      enableExport: true,
      enable2FA: false,

      setFlag: (flag, value) =>
        set((state) => ({
          ...state,
          [flag]: value,
        })),

      isEnabled: (flag) => get()[flag],
    }),
    {
      name: 'feature-flags-storage',
    }
  )
);

// Hook helper
export function useFeatureFlag(flag: keyof FeatureFlags) {
  const isEnabled = useFeatureFlags((state) => state.isEnabled(flag));
  return isEnabled;
}

// Component wrapper
export function FeatureFlag({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}
