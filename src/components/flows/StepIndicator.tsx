import { FC } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  variant?: 'horizontal' | 'vertical';
}

export const StepIndicator: FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  variant = 'horizontal'
}) => {
  const isVertical = variant === 'vertical';

  return (
    <div className={cn(
      "flex gap-2",
      isVertical ? "flex-col" : "flex-row items-center justify-between"
    )}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3",
              isVertical ? "flex-row" : "flex-col",
              !isVertical && index < steps.length - 1 && "flex-1"
            )}
          >
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-all",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                  isClickable && "cursor-pointer hover:scale-105"
                )}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <span>{index + 1}</span>
                )}
                
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {!isVertical && index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 min-w-[40px] transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                )} />
              )}
            </div>

            <div className={cn(
              "text-center",
              isVertical && "text-left flex-1"
            )}>
              <p className={cn(
                "text-sm font-medium",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
              {step.description && isVertical && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
