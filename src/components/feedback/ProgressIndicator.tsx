import { FC } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  animated?: boolean;
  label?: string;
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  showPercentage = true,
  size = 'md',
  color = 'primary',
  animated = true,
  label
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive'
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium text-foreground">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-muted rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`h-full rounded-full ${colors[color]}`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

interface StepProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
}

export const StepProgressIndicator: FC<StepProgressIndicatorProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal'
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`flex ${isHorizontal ? 'flex-row items-center' : 'flex-col'} gap-2`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div
            key={step.id}
            className={`flex ${isHorizontal ? 'flex-col items-center' : 'flex-row items-start gap-4'} flex-1`}
          >
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  border-2 transition-colors
                  ${isCompleted 
                    ? 'bg-success border-success text-success-foreground' 
                    : isCurrent 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-muted border-border text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </motion.div>
              
              {/* Connector line */}
              {index < steps.length - 1 && isHorizontal && (
                <div className={`flex-1 h-0.5 min-w-[40px] ${isCompleted ? 'bg-success' : 'bg-border'}`} />
              )}
            </div>

            {/* Step content */}
            <div className={`${isHorizontal ? 'text-center mt-2' : 'flex-1 pb-8'}`}>
              <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>

            {/* Vertical connector */}
            {index < steps.length - 1 && !isHorizontal && (
              <div 
                className={`absolute left-5 top-10 w-0.5 h-full ${isCompleted ? 'bg-success' : 'bg-border'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
