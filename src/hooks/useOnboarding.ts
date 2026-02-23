// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = 'sales_arena_onboarding_completed';
const ONBOARDING_STEP_KEY = 'sales_arena_onboarding_step';

export function useOnboarding() {
  const { user, loading: authLoading } = useAuth();
  
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });
  
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem(ONBOARDING_STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Only show onboarding if user is logged in and hasn't completed it
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Only show if user is logged in and hasn't completed onboarding
    const shouldShow = !!user && !isCompleted;
    setShowOnboarding(shouldShow);
  }, [user, authLoading, isCompleted]);

  useEffect(() => {
    localStorage.setItem(ONBOARDING_STEP_KEY, String(currentStep));
  }, [currentStep]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsCompleted(true);
    setShowOnboarding(false);
  }, []);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsCompleted(true);
    setShowOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setIsCompleted(false);
    setCurrentStep(0);
    setShowOnboarding(true);
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  return {
    isCompleted,
    currentStep,
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    goToStep,
    setShowOnboarding
  };
}
