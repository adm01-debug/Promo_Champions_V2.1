import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: 'page' | 'component' | 'widget';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { context = 'component' } = this.props;

      if (context === 'widget') {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center p-4 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
            <span className="text-sm text-destructive">Erro ao carregar</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={this.handleRetry}
              className="ml-2 h-6 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </motion.div>
        );
      }

      if (context === 'component') {
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg">Algo deu errado</CardTitle>
                </div>
                <CardDescription>
                  Este componente encontrou um erro inesperado.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      }

      // Full page error
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex items-center justify-center bg-background p-4"
        >
          <Card className="max-w-md w-full border-destructive/50">
            <CardHeader className="text-center pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <Bug className="h-8 w-8 text-destructive" />
              </motion.div>
              <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
              <CardDescription className="text-base mt-2">
                Encontramos um erro inesperado. Nossa equipe foi notificada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-32">
                  <p className="text-destructive font-semibold">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1 gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ir para início
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
