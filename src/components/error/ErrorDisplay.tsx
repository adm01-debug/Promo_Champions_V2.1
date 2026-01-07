import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | null;
  showStack?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  variant?: 'inline' | 'fullPage' | 'card';
  className?: string;
}

export const ErrorDisplay: FC<ErrorDisplayProps> = ({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado. Por favor, tente novamente.',
  error,
  showStack = false,
  onRetry,
  onGoHome,
  onGoBack,
  variant = 'card',
  className,
}) => {
  const content = (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4"
      >
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </motion.div>
      
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">{message}</p>
      
      {error && showStack && (
        <pre className="text-xs text-left bg-muted p-4 rounded-lg overflow-auto max-w-full mb-6">
          {error.stack || error.message}
        </pre>
      )}
      
      <div className="flex flex-wrap gap-3 justify-center">
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Ir para Home
          </Button>
        )}
      </div>
    </>
  );

  if (variant === 'fullPage') {
    return (
      <div className={cn('min-h-screen flex flex-col items-center justify-center p-6', className)}>
        {content}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-col items-center py-8', className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border bg-card p-8 flex flex-col items-center', className)}>
      {content}
    </div>
  );
};

// Error 404
interface NotFoundProps {
  title?: string;
  message?: string;
  onGoHome?: () => void;
  onGoBack?: () => void;
}

export const NotFound: FC<NotFoundProps> = ({
  title = 'Página não encontrada',
  message = 'A página que você está procurando não existe ou foi movida.',
  onGoHome,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-8xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">{message}</p>
        <div className="flex gap-3 justify-center">
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome}>
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
