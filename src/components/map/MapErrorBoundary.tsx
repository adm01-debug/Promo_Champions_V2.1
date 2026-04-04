import { Component, ReactNode } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[MapErrorBoundary]", error, info.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass rounded-lg flex flex-col items-center justify-center gap-4 p-8" style={{ height: "500px" }}>
          <MapPin className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Erro ao carregar o mapa
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Houve um problema ao renderizar o mapa. Isso pode ocorrer por instabilidade na conexão ou incompatibilidade do navegador.
            </p>
            {this.state.error && (
              <p className="text-xs text-destructive font-mono mt-2">
                {this.state.error.message}
              </p>
            )}
          </div>
          <Button onClick={this.handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
