import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "sales-arena-onboarding-completed";
const TOUR_KEY = "sales-arena-tour-completed";

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  hasCompletedTour: boolean;
  currentTourStep: number;
}

export function useOnboardingTour() {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === "undefined") {
      return { hasCompletedOnboarding: true, hasCompletedTour: true, currentTourStep: 0 };
    }
    
    const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY) === "true";
    const tourCompleted = localStorage.getItem(TOUR_KEY) === "true";
    
    return {
      hasCompletedOnboarding: onboardingCompleted,
      hasCompletedTour: tourCompleted,
      currentTourStep: 0,
    };
  });

  const [showTour, setShowTour] = useState(false);

  // Show tour after onboarding is completed but tour hasn't been done
  useEffect(() => {
    if (state.hasCompletedOnboarding && !state.hasCompletedTour) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.hasCompletedOnboarding, state.hasCompletedTour]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setState(prev => ({ ...prev, hasCompletedOnboarding: true }));
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "true");
    setState(prev => ({ ...prev, hasCompletedTour: true }));
    setShowTour(false);
  }, []);

  const skipTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "true");
    setState(prev => ({ ...prev, hasCompletedTour: true }));
    setShowTour(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(TOUR_KEY);
    setState({
      hasCompletedOnboarding: false,
      hasCompletedTour: false,
      currentTourStep: 0,
    });
  }, []);

  const startTour = useCallback(() => {
    setShowTour(true);
    setState(prev => ({ ...prev, currentTourStep: 0 }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentTourStep: prev.currentTourStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentTourStep: Math.max(0, prev.currentTourStep - 1) }));
  }, []);

  return {
    ...state,
    showTour,
    completeOnboarding,
    completeTour,
    skipTour,
    resetOnboarding,
    startTour,
    nextStep,
    prevStep,
  };
}