import { create } from 'zustand';

interface ABTest {
  id: string;
  name: string;
  variants: string[];
  currentVariant: string;
}

interface ABTestStore {
  tests: Record<string, ABTest>;
  getVariant: (testId: string) => string;
  setVariant: (testId: string, variant: string) => void;
}

export const useABTest = create<ABTestStore>((set, get) => ({
  tests: {},
  
  getVariant: (testId) => {
    const test = get().tests[testId];
    if (!test) {
      // Assign random variant
      const variants = ['A', 'B'];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      set((state) => ({
        tests: {
          ...state.tests,
          [testId]: {
            id: testId,
            name: testId,
            variants,
            currentVariant: variant,
          },
        },
      }));
      return variant;
    }
    return test.currentVariant;
  },
  
  setVariant: (testId, variant) =>
    set((state) => ({
      tests: {
        ...state.tests,
        [testId]: {
          ...state.tests[testId],
          currentVariant: variant,
        },
      },
    })),
}));
