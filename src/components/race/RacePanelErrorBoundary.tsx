import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  panelName: string;
  children: ReactNode;
  /** Fallback minimalista customizado (opcional). */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg?: string;
}

/**
 * Error boundary granular para painéis da Race Arena.
 * Isola falhas: um overlay quebrado não derruba toda a Arena.
 */
export class RacePanelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`[RacePanel:${this.props.panelName}]`, error, info.componentStack);
    }
  }

  reset = () => this.setState({ hasError: false, errorMsg: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <Card role="alert" className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden />
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-sm font-semibold">Este painel está indisponível</p>
              <p className="text-xs text-muted-foreground">
                Houve um erro ao carregar “{this.props.panelName}”. Os outros painéis continuam funcionando.
              </p>
            </div>
            <Button onClick={this.reset} size="sm" variant="outline">
              <RefreshCcw className="w-3 h-3 mr-1.5" /> Tentar de novo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}
