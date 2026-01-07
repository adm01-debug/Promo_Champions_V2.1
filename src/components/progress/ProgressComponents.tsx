import { FC } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

const variantClasses = {
  default: '',
  success: '[&>div]:bg-green-500',
  warning: '[&>div]:bg-yellow-500',
  danger: '[&>div]:bg-destructive'
};

export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'default',
  className
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{value.toLocaleString()}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn(sizeClasses[size], variantClasses[variant])} 
      />
    </div>
  );
};

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const StepProgress: FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  labels,
  className
}) => (
  <div className={cn("w-full", className)}>
    <div className="flex items-center justify-between mb-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
            i < currentStep 
              ? "bg-primary text-primary-foreground border-primary" 
              : i === currentStep 
                ? "border-primary text-primary" 
                : "border-muted text-muted-foreground"
          )}>
            {i + 1}
          </div>
          {labels?.[i] && (
            <span className="text-xs mt-1 text-center">{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
    <Progress value={(currentStep / totalSteps) * 100} className="h-1" />
  </div>
);

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

export const CircularProgress: FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showValue = true,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-300"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showValue && (
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

interface GoalProgressProps {
  current: number;
  goal: number;
  label: string;
  className?: string;
}

export const GoalProgress: FC<GoalProgressProps> = ({
  current,
  goal,
  label,
  className
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn(
          "text-sm font-bold",
          isComplete ? "text-green-500" : "text-muted-foreground"
        )}>
          {current.toLocaleString()} / {goal.toLocaleString()}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn("h-2", isComplete && "[&>div]:bg-green-500")} 
      />
    </div>
  );
};
