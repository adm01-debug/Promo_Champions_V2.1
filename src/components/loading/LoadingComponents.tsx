import { FC } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />;
};

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({ 
  message = "Carregando...",
  fullScreen = false
}) => (
  <div className={cn(
    "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50",
    fullScreen ? "fixed inset-0" : "absolute inset-0"
  )}>
    <Spinner size="lg" />
    <p className="mt-4 text-sm text-muted-foreground">{message}</p>
  </div>
);

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingDots: FC<LoadingDotsProps> = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'h-1.5 w-1.5', md: 'h-2 w-2', lg: 'h-3 w-3' };
  const gapClasses = { sm: 'gap-1', md: 'gap-1.5', lg: 'gap-2' };

  return (
    <div className={cn("flex items-center", gapClasses[size])}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={cn(
            "rounded-full bg-primary animate-bounce",
            sizeClasses[size]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
};

interface LoadingBarProps {
  progress?: number;
  indeterminate?: boolean;
}

export const LoadingBar: FC<LoadingBarProps> = ({ progress, indeterminate = false }) => (
  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
    {indeterminate ? (
      <div className="h-full w-1/3 bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
    ) : (
      <div 
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${progress || 0}%` }}
      />
    )}
  </div>
);

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: FC<PageLoadingProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <Spinner size="xl" />
    {message && <p className="mt-4 text-muted-foreground">{message}</p>}
  </div>
);

interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const ButtonLoading: FC<ButtonLoadingProps> = ({ loading, children }) => (
  <>
    {loading && <Spinner size="sm" className="mr-2" />}
    {children}
  </>
);
