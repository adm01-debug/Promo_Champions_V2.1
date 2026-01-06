import { useState, ReactNode, createContext, useContext } from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Context for form step access
interface ProgressiveFormContextValue<T extends FieldValues> {
  form: UseFormReturn<T>;
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const ProgressiveFormContext = createContext<ProgressiveFormContextValue<any> | null>(null);

export function useProgressiveForm<T extends FieldValues>() {
  const context = useContext(ProgressiveFormContext);
  if (!context) throw new Error('useProgressiveForm must be used within ProgressiveForm');
  return context as ProgressiveFormContextValue<T>;
}

// Step component
export interface FormStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  validation?: string[]; // Field names to validate before proceeding
  optional?: boolean;
}

export function FormStep({ children }: FormStepProps) {
  return <>{children}</>;
}

// Main Progressive Form
interface ProgressiveFormProps<T extends FieldValues> {
  children: ReactNode;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onStepChange?: (step: number) => void;
  className?: string;
  showProgress?: boolean;
  allowSkipOptional?: boolean;
}

export function ProgressiveForm<T extends FieldValues>({
  children,
  defaultValues,
  onSubmit,
  onStepChange,
  className,
  showProgress = true,
  allowSkipOptional = true,
}: ProgressiveFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<T>({ defaultValues, mode: 'onChange' });
  
  // Extract steps from children
  const steps = (Array.isArray(children) ? children : [children]).filter(
    (child): child is React.ReactElement<FormStepProps> => 
      child && typeof child === 'object' && 'props' in child && 'title' in (child.props || {})
  );
  
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepConfig = steps[currentStep]?.props;
  
  const validateCurrentStep = async () => {
    if (!currentStepConfig?.validation?.length) return true;
    const result = await form.trigger(currentStepConfig.validation as any);
    return result;
  };
  
  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      onStepChange?.(step);
    }
  };
  
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid || (allowSkipOptional && currentStepConfig?.optional)) {
      goToStep(currentStep + 1);
    }
  };
  
  const prevStep = () => goToStep(currentStep - 1);
  
  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  });
  
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  const contextValue: ProgressiveFormContextValue<T> = {
    form,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
  };
  
  return (
    <ProgressiveFormContext.Provider value={contextValue}>
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        {showProgress && (
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg">{currentStepConfig?.title}</CardTitle>
              <span className="text-sm text-muted-foreground">
                Passo {currentStep + 1} de {totalSteps}
              </span>
            </div>
            {currentStepConfig?.description && (
              <CardDescription>{currentStepConfig.description}</CardDescription>
            )}
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {steps[currentStep]}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            {/* Step indicators */}
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => idx < currentStep && goToStep(idx)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    idx === currentStep 
                      ? 'bg-primary w-4' 
                      : idx < currentStep 
                        ? 'bg-primary/60 cursor-pointer hover:bg-primary/80' 
                        : 'bg-muted'
                  )}
                  disabled={idx >= currentStep}
                />
              ))}
            </div>
            
            {isLastStep ? (
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Finalizar
              </Button>
            ) : (
              <Button type="button" onClick={nextStep} className="gap-2">
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </ProgressiveFormContext.Provider>
  );
}

// Convenience exports
export { ProgressiveForm as default };
