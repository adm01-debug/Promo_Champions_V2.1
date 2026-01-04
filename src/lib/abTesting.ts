// A/B Testing Framework
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: Array<{ id: string; name: string; weight: number }>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: string;
}

interface ABTestingStore {
  experiments: Experiment[];
  assignments: Record<string, string>;
  assignVariant: (experimentId: string) => string;
  getVariant: (experimentId: string) => string | null;
  trackConversion: (experimentId: string, metric: string, value?: number) => void;
  loadExperiments: (experiments: Experiment[]) => void;
}

export const useABTesting = create<ABTestingStore>()(
  persist(
    (set, get) => ({
      experiments: [],
      assignments: {},
      
      assignVariant: (experimentId) => {
        const existing = get().assignments[experimentId];
        if (existing) return existing;
        
        const experiment = get().experiments.find(e => e.id === experimentId);
        if (!experiment || !experiment.isActive) return 'control';
        
        // Weighted random selection
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const variant of experiment.variants) {
          cumulative += variant.weight;
          if (random < cumulative) {
            set((state) => ({
              assignments: { ...state.assignments, [experimentId]: variant.id },
            }));
            return variant.id;
          }
        }
        
        return experiment.variants[0].id;
      },
      
      getVariant: (experimentId) => {
        return get().assignments[experimentId] || null;
      },
      
      trackConversion: async (experimentId, metric, value = 1) => {
        const variantId = get().assignments[experimentId];
        if (!variantId) return;
        
        // Send to analytics
        console.log('Conversion tracked:', { experimentId, variantId, metric, value });
        
        // Could integrate with analytics service
        if (window.gtag) {
          window.gtag('event', 'conversion', {
            experiment_id: experimentId,
            variant_id: variantId,
            metric,
            value,
          });
        }
      },
      
      loadExperiments: (experiments) => set({ experiments }),
    }),
    { name: 'ab-testing' }
  )
);

// Hook for using experiments
export const useExperiment = (experimentId: string) => {
  const { assignVariant, getVariant, trackConversion } = useABTesting();
  
  const variant = getVariant(experimentId) || assignVariant(experimentId);
  
  return {
    variant,
    trackConversion: (metric: string, value?: number) => 
      trackConversion(experimentId, metric, value),
  };
};

// Example experiments
export const defaultExperiments: Experiment[] = [
  {
    id: 'button-color',
    name: 'Primary Button Color Test',
    description: 'Testing blue vs green primary button',
    variants: [
      { id: 'control', name: 'Blue', weight: 50 },
      { id: 'variant', name: 'Green', weight: 50 },
    ],
    isActive: true,
    startDate: new Date().toISOString(),
  },
];
