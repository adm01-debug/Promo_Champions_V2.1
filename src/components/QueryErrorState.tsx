import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  /** Use "inline" for card sections, "full" for full-page placeholder */
  variant?: 'inline' | 'full';
  message?: string;
}

export function QueryErrorState({
  error,
  onRetry,
  variant = 'inline',
  message,
}: QueryErrorStateProps) {
  const errorMessage =
    message ??
    (error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados.');

  if (variant === 'full') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-semibold text-sm text-destructive">Falha ao carregar</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-4 text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/5">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{errorMessage}</span>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="ml-2 shrink-0">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
