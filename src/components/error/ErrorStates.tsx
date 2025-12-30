import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, WifiOff, CheckCircle, AlertTriangle, Info, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback: FC<ErrorBoundaryFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle>Algo deu errado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded-lg text-left">
              <p className="text-xs font-mono text-destructive break-all">
                {error.message}
              </p>
            </div>
          )}
          
          <Button onClick={resetError} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Network error state
interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkError: FC<NetworkErrorProps> = ({ 
  onRetry,
  message = 'Não foi possível conectar ao servidor'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Erro de conexão</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
};

// Loading state with retry
interface LoadingErrorProps {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const LoadingError: FC<LoadingErrorProps> = ({
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent
}) => {
  if (isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <NetworkError onRetry={onRetry} message={error.message} />;
  }

  return <>{children}</>;
};

// Inline error message
interface InlineErrorProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

export const InlineError: FC<InlineErrorProps> = ({ error, onDismiss, className }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive',
        className
      )}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{error}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:opacity-70">
          ×
        </button>
      )}
    </motion.div>
  );
};

// Success message
interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  autoHide?: number;
  className?: string;
}

export const SuccessMessage: FC<SuccessMessageProps> = ({ 
  message, 
  onDismiss, 
  autoHide,
  className 
}) => {
  useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHide);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success',
        className
      )}
    >
      <CheckCircle className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:opacity-70">
          ×
        </button>
      )}
    </motion.div>
  );
};

// Info message
interface InfoMessageProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
}

export const InfoMessage: FC<InfoMessageProps> = ({ 
  message, 
  title,
  onDismiss,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg bg-info/10 border border-info/20 text-sm',
        className
      )}
    >
      <Info className="w-5 h-5 shrink-0 text-info mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium text-foreground mb-1">{title}</p>}
        <p className="text-muted-foreground">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-muted-foreground hover:text-foreground">
          ×
        </button>
      )}
    </motion.div>
  );
};
