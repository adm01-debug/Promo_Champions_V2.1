import { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  section?: string;
  fallbackHeight?: number;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Error boundary localizado por seção do Win/Loss Intelligence.
 * Falha em um chart/painel não derruba a página inteira — apenas a seção.
 */
export class WinLossErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(): void {
    // silently swallow — telemetry could be wired here
  }

  reset = (): void => this.setState({ hasError: false, message: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent
          className="flex flex-col items-center justify-center text-center gap-2 py-8"
          style={this.props.fallbackHeight ? { minHeight: this.props.fallbackHeight } : undefined}
        >
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
          <p className="text-sm font-medium">
            Erro em {this.props.section ?? "esta seção"}
          </p>
          <p className="text-xs text-muted-foreground max-w-md">
            {this.state.message ?? "Algo inesperado aconteceu. Recarregue para tentar novamente."}
          </p>
          <Button size="sm" variant="outline" onClick={this.reset} className="mt-1">
            <RefreshCcw className="h-3 w-3 mr-1" /> Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }
}
