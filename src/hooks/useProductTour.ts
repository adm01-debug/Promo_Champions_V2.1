import { useState, useCallback, useEffect } from 'react';

type Step = {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  disableBeacon?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
};

interface UseProductTourReturn {
  isActive: boolean;
  currentStep: number;
  currentStepData: Step | null;
  steps: Step[];
  start: (fromStep?: number) => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  goToStep: (stepIndex: number) => void;
  skip: () => void;
  isComplete: boolean;
  progress: number;
}

export const useProductTour = (
  steps: Step[],
  options?: {
    onComplete?: () => void;
    onSkip?: () => void;
    storageKey?: string;
    autoStart?: boolean;
  }
): UseProductTourReturn => {
  const { 
    onComplete, 
    onSkip, 
    storageKey = 'product-tour-complete',
    autoStart = false 
  } = options || {};

  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Check if tour was already completed
  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (completed === 'true') {
      setIsComplete(true);
    } else if (autoStart && steps.length > 0) {
      setIsActive(true);
    }
  }, [storageKey, autoStart, steps.length]);

  const start = useCallback((fromStep = 0) => {
    setCurrentStep(fromStep);
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const next = useCallback(() => {
    const currentData = steps[currentStep];
    if (currentData?.onNext) {
      currentData.onNext();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tour complete
      setIsActive(false);
      setIsComplete(true);
      localStorage.setItem(storageKey, 'true');
      onComplete?.();
    }
  }, [currentStep, steps, storageKey, onComplete]);

  const prev = useCallback(() => {
    const currentData = steps[currentStep];
    if (currentData?.onPrev) {
      currentData.onPrev();
    }

    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, steps]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  const skip = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'true');
    onSkip?.();
  }, [storageKey, onSkip]);

  const currentStepData = isActive && steps[currentStep] ? steps[currentStep] : null;
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return {
    isActive,
    currentStep,
    currentStepData,
    steps,
    start,
    stop,
    next,
    prev,
    goToStep,
    skip,
    isComplete,
    progress,
  };
};

// Reset tour for a user (useful for testing or re-onboarding)
export const resetProductTour = (storageKey = 'product-tour-complete') => {
  localStorage.removeItem(storageKey);
};
