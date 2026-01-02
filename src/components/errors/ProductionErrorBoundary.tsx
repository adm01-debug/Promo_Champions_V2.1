import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Production Error:', error, errorInfo);
    
    // Enviar para serviço de monitoramento (ex: Sentry)
    if (import.meta.env.PROD) {
      // window.Sentry?.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || 'Erro inesperado'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Recarregar Página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
