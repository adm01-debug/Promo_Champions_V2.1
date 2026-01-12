import { FC } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCcw, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OfflineFallbackProps {
  onRetry?: () => void;
  message?: string;
  showRetry?: boolean;
  variant?: 'full' | 'inline' | 'minimal';
  className?: string;
}

export const OfflineFallback: FC<OfflineFallbackProps> = ({
  onRetry,
  message = 'Você está offline. Verifique sua conexão.',
  showRetry = true,
  variant = 'full',
  className,
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm',
        className
      )}>
        <WifiOff className="h-4 w-4" />
        <span>Offline</span>
        {showRetry && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2 ml-auto"
          >
            <RefreshCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg',
        className
      )}>
        <CloudOff className="h-6 w-6 text-muted-foreground" />
        <div>
          <p className="font-medium">{message}</p>
          {showRetry && onRetry && (
            <Button
              variant="link"
              size="sm"
              onClick={onRetry}
              className="h-auto p-0 mt-1"
            >
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-[300px] flex items-center justify-center p-6',
      className
    )}>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6"
          >
            <motion.div
              animate={{ 
                opacity: [1, 0.5, 1],
                scale: [1, 0.95, 1] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <WifiOff className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </motion.div>
          </motion.div>

          <h3 className="text-xl font-semibold mb-2">Sem conexão</h3>
          <p className="text-muted-foreground mb-6">{message}</p>

          {showRetry && onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
