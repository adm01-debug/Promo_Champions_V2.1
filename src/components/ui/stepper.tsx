import { FC, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, Check, Circle } from 'lucide-react';

interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content?: ReactNode;
  isOptional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  showProgress?: boolean;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const stepVariants: Variants = {
  inactive: { scale: 1, opacity: 0.5 },
  active: { scale: 1.05, opacity: 1 },
  completed: { scale: 1, opacity: 1 },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, height: 0, y: -10 },
  visible: { opacity: 1, height: 'auto', y: 0 },
  exit: { opacity: 0, height: 0, y: 10 },
};

/**
 * Stepper - Multi-step wizard component with animations
 */
export const Stepper: FC<StepperProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  showProgress = true,
  onStepClick,
  className,
}) => {
  const progressPercent = ((currentStep + 1) / steps.length) * 100;
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progressPercent)}% completo</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div
        className={cn(
          "flex gap-2",
          isHorizontal ? "flex-row items-start" : "flex-col"
        )}
        role="tablist"
        aria-label="Passos do processo"
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = onStepClick && (isCompleted || index === currentStep + 1);

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3",
                isHorizontal ? "flex-1" : "w-full"
              )}
            >
              {/* Step indicator */}
              <motion.button
                variants={stepVariants}
                animate={isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  "border-2 transition-colors font-semibold text-sm",
                  isCompleted && "bg-success border-success text-success-foreground",
                  isActive && "bg-primary border-primary text-primary-foreground",
                  !isActive && !isCompleted && "bg-muted border-border text-muted-foreground",
                  isClickable && "cursor-pointer hover:opacity-80"
                )}
                role="tab"
                aria-selected={isActive}
                aria-label={`${step.title}${isCompleted ? ' - Concluído' : ''}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}

                {/* Pulse animation for active step */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Step content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.isOptional && (
                    <span className="text-xs text-muted-foreground">(Opcional)</span>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {step.description}
                  </p>
                )}

                {/* Step content (for vertical orientation) */}
                {!isHorizontal && (
                  <AnimatePresence mode="wait">
                    {isActive && step.content && (
                      <motion.div
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="mt-4 pl-0"
                      >
                        {step.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Connector line (horizontal) */}
              {isHorizontal && index < steps.length - 1 && (
                <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded",
                      isCompleted ? "bg-success" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content area (for horizontal orientation) */}
      {isHorizontal && (
        <AnimatePresence mode="wait">
          {steps[currentStep]?.content && (
            <motion.div
              key={currentStep}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {steps[currentStep].content}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Export step navigation buttons
interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const StepNavigation: FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  isNextDisabled = false,
  isPreviousDisabled = false,
  isLoading = false,
  className,
}) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={cn("flex items-center justify-between pt-4 border-t border-border", className)}>
      <button
        onClick={onPrevious}
        disabled={currentStep === 0 || isPreviousDisabled}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          (currentStep === 0 || isPreviousDisabled) && "opacity-50 cursor-not-allowed"
        )}
      >
        Anterior
      </button>

      <button
        onClick={isLastStep ? onComplete : onNext}
        disabled={isNextDisabled || isLoading}
        className={cn(
          "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 active:scale-95",
          (isNextDisabled || isLoading) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Circle className="h-4 w-4 animate-spin" />
            Processando...
          </span>
        ) : isLastStep ? (
          "Concluir"
        ) : (
          <span className="flex items-center gap-1">
            Próximo
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </button>
    </div>
  );
};
