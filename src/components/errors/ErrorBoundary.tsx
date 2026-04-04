import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStackTrace: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStackTrace: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStackTrace: false,
    });
  };

  toggleStackTrace = (): void => {
    this.setState(prev => ({ showStackTrace: !prev.showStackTrace }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showStackTrace } = this.state;
      const showDetails = this.props.showDetails ?? import.meta.env.DEV;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-lg w-full glass border-destructive/30">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-destructive/20 w-fit mb-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado nesta seção da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showDetails && error && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-mono text-destructive break-all">
                      {error.name}: {error.message}
                    </p>
                  </div>
                  
                  {errorInfo?.componentStack && (
                    <button
                      onClick={this.toggleStackTrace}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Bug className="h-3 w-3" />
                      {showStackTrace ? "Ocultar" : "Mostrar"} stack trace
                      {showStackTrace ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  )}
                  
                  {showStackTrace && errorInfo?.componentStack && (
                    <pre className="p-3 rounded-lg bg-muted/50 text-xs font-mono text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 gradient-primary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para início
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Se o problema persistir, tente recarregar a página ou entre em contato com o suporte.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks context
interface _ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
