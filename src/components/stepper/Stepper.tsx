import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, LucideIcon } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (index: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  onStepClick,
  className,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-center' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;
        const Icon = step.icon || (isCompleted ? CheckCircle2 : Circle);

        return (
          <React.Fragment key={step.id}>
            <motion.div
              className={cn(
                'flex items-center',
                isHorizontal ? 'flex-col' : 'flex-row gap-3',
                isClickable && 'cursor-pointer'
              )}
              onClick={() => isClickable && onStepClick?.(index)}
              whileHover={isClickable ? { scale: 1.05 } : undefined}
              whileTap={isClickable ? { scale: 0.95 } : undefined}
            >
              <motion.div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary',
                  !isCompleted && !isCurrent && 'border-muted text-muted-foreground'
                )}
                animate={{
                  scale: isCurrent ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  repeat: isCurrent ? Infinity : 0,
                  duration: 2,
                }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              <div className={cn('text-center', isHorizontal ? 'mt-2' : '')}>
                <p
                  className={cn(
                    'text-sm font-medium',
                    (isCompleted || isCurrent) && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </motion.div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1',
                  isHorizontal ? 'h-0.5 mx-4' : 'w-0.5 my-2 ml-5',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Mini progress stepper
interface MiniStepperProps {
  total: number;
  current: number;
  className?: string;
}

export const MiniStepper: React.FC<MiniStepperProps> = ({
  total,
  current,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i < current
              ? 'bg-primary w-6'
              : i === current
              ? 'bg-primary/50 w-4'
              : 'bg-muted w-2'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>
  );
};

// Circular progress stepper
interface CircularStepperProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const CircularStepper: React.FC<CircularStepperProps> = ({
  current,
  total,
  size = 60,
  strokeWidth = 4,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (current / total) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <span className="absolute text-sm font-medium">
        {current}/{total}
      </span>
    </div>
  );
};
