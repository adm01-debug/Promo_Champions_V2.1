import { useState, useCallback, ReactNode, FC, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isOptional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

interface MultiStepFormContextValue {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  formData: Record<string, any>;
  updateFormData: (data: Record<string, any>) => void;
}

const MultiStepFormContext = createContext<MultiStepFormContextValue | null>(null);

export function useMultiStepForm() {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error('useMultiStepForm must be used within MultiStepForm');
  }
  return context;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: (data: Record<string, any>) => void | Promise<void>;
  initialData?: Record<string, any>;
  className?: string;
  showProgress?: boolean;
  allowSkipOptional?: boolean;
}

/**
 * MultiStepForm - Multi-step form wizard with validation
 */
export const MultiStepForm: FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  initialData = {},
  className,
  showProgress = true,
  allowSkipOptional = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateFormData = useCallback((data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const validateCurrentStep = useCallback(async () => {
    const step = steps[currentStep];
    if (!step.validate) return true;
    
    try {
      return await step.validate();
    } catch {
      return false;
    }
  }, [steps, currentStep]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await onComplete(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [currentStep, steps.length, formData, onComplete, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    // Only allow going to completed steps or current step
    if (step <= currentStep || completedSteps.has(step - 1)) {
      setCurrentStep(step);
    }
  }, [currentStep, completedSteps]);

  const skipStep = useCallback(() => {
    if (steps[currentStep].isOptional && allowSkipOptional) {
      setCurrentStep(prev => prev + 1);
    }
  }, [steps, currentStep, allowSkipOptional]);

  const contextValue: MultiStepFormContextValue = {
    currentStep,
    totalSteps: steps.length,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    formData,
    updateFormData,
  };

  const activeStep = steps[currentStep];

  return (
    <MultiStepFormContext.Provider value={contextValue}>
      <div className={cn("space-y-6", className)}>
        {/* Progress indicator */}
        {showProgress && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  disabled={index > currentStep && !completedSteps.has(index - 1)}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    index <= currentStep || completedSteps.has(index)
                      ? "text-primary cursor-pointer"
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      index < currentStep || completedSteps.has(index)
                        ? "bg-primary text-primary-foreground"
                        : index === currentStep
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {completedSteps.has(index) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {step.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{activeStep.title}</h2>
              {activeStep.description && (
                <p className="text-sm text-muted-foreground">
                  {activeStep.description}
                </p>
              )}
            </div>

            {activeStep.component}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            {activeStep.isOptional && allowSkipOptional && (
              <Button variant="ghost" onClick={skipStep}>
                Pular
              </Button>
            )}
            
            <Button
              onClick={nextStep}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                'Processando...'
              ) : currentStep === steps.length - 1 ? (
                'Concluir'
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MultiStepFormContext.Provider>
  );
};
