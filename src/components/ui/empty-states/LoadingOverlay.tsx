import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress';
  progress?: number;
  onCancel?: () => void;
  blur?: boolean;
  children?: ReactNode;
  className?: string;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Carregando...',
  variant = 'spinner',
  progress,
  onCancel,
  blur = true,
  children,
  className
}) => {
  if (!isLoading) return <>{children}</>;

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-primary"
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-full h-full rounded-full bg-primary/20"
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        );
      case 'progress':
        return (
          <div className="w-48">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {progress !== undefined && (
              <p className="text-sm text-center mt-2 text-muted-foreground">
                {Math.round(progress)}%
              </p>
            )}
          </div>
        );
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-10 w-10 text-primary" />
          </motion.div>
        );
    }
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center z-50",
          blur ? "backdrop-blur-sm bg-background/80" : "bg-background/95"
        )}
      >
        {renderLoader()}
        
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            {message}
          </motion.p>
        )}

        {onCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="mt-4"
            >
              Cancelar
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// Componente de erro com retry
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: FC<ErrorStateProps> = ({
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados. Tente novamente.',
  onRetry,
  className
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className
    )}
  >
    <motion.div
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 0.5 }}
      className="text-4xl mb-4"
    >
      😕
    </motion.div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    )}
  </motion.div>
);
