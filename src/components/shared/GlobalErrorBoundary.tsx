import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/errorTracking";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureError(error, {
      severity: "critical",
      category: "ui",
      component: "GlobalErrorBoundary",
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6" role="alert" aria-live="assertive">
          <div className="max-w-md w-full glass border-destructive/20 rounded-3xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic text-foreground">
                Falha Crítica Detectada
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O sistema encontrou uma instabilidade inesperada. A equipe técnica já foi notificada automaticamente via Enterprise Error Monitor.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="p-4 bg-muted/50 rounded-xl text-left overflow-auto max-h-40">
                <code className="text-[10px] text-destructive/80 font-mono break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest py-6 rounded-2xl shadow-lg shadow-primary/20"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Recarregar Sistema
              </Button>
              <Button 
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full border-primary/20 hover:bg-primary/5 font-black uppercase tracking-widest py-6 rounded-2xl"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
